// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Runs the React Native SRP code path (`*.native.ts`) against the real
 * `@aws-amplify/react-native` package with the `AmplifyRTNCore` native module
 * absent, and checks that it derives exactly the same keys as the web path.
 */

import { TextEncoder } from 'util';

// jsdom does not provide TextEncoder, which the key derivation uses.
if (typeof globalThis.TextEncoder === 'undefined') {
	Object.assign(globalThis, { TextEncoder });
}

jest.mock('react-native', () => ({
	NativeModules: {},
	Platform: { OS: 'ios', isPad: false, select: () => '' },
}));

const SRP = '../../../../../src/providers/cognito/utils/srp';

type SrpModules =
	typeof import('../../../../../src/providers/cognito/utils/srp/AuthenticationHelper') &
		typeof import('../../../../../src/providers/cognito/utils/srp/BigInteger') &
		typeof import('../../../../../src/providers/cognito/utils/srp/calculate') &
		typeof import('../../../../../src/providers/cognito/utils/srp/constants');

const loadSrp = (): SrpModules => {
	let modules: SrpModules | undefined;
	jest.isolateModules(() => {
		modules = {
			...require(`${SRP}/AuthenticationHelper`),
			...require(`${SRP}/BigInteger`),
			...require(`${SRP}/calculate`),
			...require(`${SRP}/constants`),
		};
	});

	return modules!;
};

// Load the web implementation first: `jest.doMock` registrations outlive
// `jest.isolateModules`, so the native redirects must come after it.
const web = loadSrp();
jest.doMock(`${SRP}/BigInteger`, () =>
	jest.requireActual(`${SRP}/BigInteger/index.native`),
);
jest.doMock(`${SRP}/calculate/calculateS`, () =>
	jest.requireActual(`${SRP}/calculate/calculateS.native`),
);
const native = loadSrp();

// Fixed inputs so both implementations see identical values.
const aHex =
	'3a6b0c1f5e2d4c7b8a9f0e1d2c3b4a5968778695a4b3c2d1e0f1e2d3c4b5a69788796a5b4c3d2e1f0e1d2c3b4a59687786950a1b2c3d4e5f60718293a4b5c6d7e8f9' +
	'0f1e2d3c4b5a69788796a5b4c3d2e1f00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff0123456789abcdef0123456789abcdef';
const serverBHex =
	'7c4f2e9d1a3b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6' +
	'0718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6';
const saltHex = '9a8b7c6d5e4f30211203f4e5d6c7b8a9';
const input = {
	username: 'user@example.com',
	password: 'Correct-Horse-Battery-Staple-1',
};

const buildHelper = async (srp: SrpModules) => {
	const N = new srp.BigInteger(srp.INIT_N, 16);
	const g = new srp.BigInteger('2', 16);
	const a = new srp.BigInteger(aHex, 16);
	const A = await srp.calculateA({ a, g, N });

	return {
		A,
		helper: new srp.AuthenticationHelper({
			userPoolName: 'abcdefgh',
			a,
			g,
			A,
			N,
		}),
	};
};

describe('SRP on React Native without the AmplifyRTNCore native module', () => {
	it('uses the React Native modPow override', () => {
		expect(native.BigInteger.prototype.modPow).not.toBe(
			web.BigInteger.prototype.modPow,
		);
	});

	it('computes the same public value A as the web implementation', async () => {
		const [{ A: webA }, { A: nativeA }] = await Promise.all([
			buildHelper(web),
			buildHelper(native),
		]);

		expect(nativeA.toString(16)).toBe(webA.toString(16));
	});

	it('derives the same password authentication key as the web implementation', async () => {
		const [{ helper: webHelper }, { helper: nativeHelper }] = await Promise.all(
			[buildHelper(web), buildHelper(native)],
		);

		const getKey = (
			helper: InstanceType<SrpModules['AuthenticationHelper']>,
			srp: SrpModules,
		) =>
			helper.getPasswordAuthenticationKey({
				...input,
				serverBValue: new srp.BigInteger(serverBHex, 16),
				salt: new srp.BigInteger(saltHex, 16),
			});

		const [webKey, nativeKey] = await Promise.all([
			getKey(webHelper, web),
			getKey(nativeHelper, native),
		]);

		expect(nativeKey).toHaveLength(16);
		expect(Array.from(nativeKey)).toEqual(Array.from(webKey));
	});

	it('generates a device verifier that matches the web implementation', async () => {
		const { helper: nativeHelper } = await buildHelper(native);
		await nativeHelper.generateHashDevice('us-west-2_deviceGroup', 'deviceKey');

		// Recompute g^x mod N with the web implementation from the generated salt
		// and random password, following the same derivation.
		const { getHashFromHex } = require(`${SRP}/getHashFromHex`);
		const { getHashFromData } = require(`${SRP}/getHashFromData`);
		const salt = nativeHelper.getSaltToHashDevices();
		const hashedDevice = getHashFromData(
			`us-west-2_deviceGroupdeviceKey:${nativeHelper.getRandomPassword()}`,
		);
		const x = new web.BigInteger(getHashFromHex(salt + hashedDevice), 16);
		const expected = await new Promise<string>((resolve, reject) => {
			new web.BigInteger('2', 16).modPow(
				x,
				new web.BigInteger(web.INIT_N, 16),
				(err: unknown, result: any) => {
					if (err) reject(err);
					else resolve(result.toString(16));
				},
			);
		});

		expect(
			new web.BigInteger(nativeHelper.getVerifierDevices(), 16).toString(16),
		).toBe(expected);
	});
});
