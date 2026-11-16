// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Known-answer vectors generated independently with Python's built-in `pow()`
// over the 3072-bit SRP group used by Cognito.
import srpVectors from './testUtils/srpVectors.json';

interface MockPlatform {
	OS: string;
	isPad?: boolean;
	constants?: Record<string, unknown>;
	select(spec: Record<string, string>): string;
}

const mockPlatform: MockPlatform = {
	OS: 'ios',
	select: spec => spec.default ?? '',
};

jest.mock('react-native', () => ({
	NativeModules: {},
	Platform: mockPlatform,
}));

describe('APIs when the AmplifyRTNCore native module is not linked', () => {
	const loadApis = (): typeof import('../src/apis') => {
		let apis: typeof import('../src/apis') | undefined;
		jest.isolateModules(() => {
			apis = require('../src/apis');
		});

		return apis!;
	};

	afterEach(() => {
		mockPlatform.OS = 'ios';
		delete mockPlatform.isPad;
		delete mockPlatform.constants;
	});

	describe('computeModPow', () => {
		it.each(srpVectors.modPow.map((v, i) => [i, v] as const))(
			'matches the known answer for vector %i',
			async (_, { expected, ...payload }) => {
				const { computeModPow } = loadApis();
				expect(await computeModPow(payload)).toBe(expected);
			},
		);

		it('returns lowercase hex without leading zeros, like the native module', async () => {
			const { computeModPow } = loadApis();
			expect(
				await computeModPow({ base: '0A', exponent: '2', divisor: 'FFFF' }),
			).toBe('64');
		});

		it('normalizes a negative base into the field', async () => {
			const { computeModPow } = loadApis();
			// (-3)^3 mod 7 = -27 mod 7 = 1
			expect(
				await computeModPow({ base: '-3', exponent: '3', divisor: '7' }),
			).toBe('1');
		});

		it('returns 0 when the divisor is 1', async () => {
			const { computeModPow } = loadApis();
			expect(
				await computeModPow({ base: 'ff', exponent: '10', divisor: '1' }),
			).toBe('0');
		});

		it('returns 1 for a zero exponent', async () => {
			const { computeModPow } = loadApis();
			expect(
				await computeModPow({ base: 'ff', exponent: '0', divisor: '7' }),
			).toBe('1');
		});

		it('agrees with plain modular exponentiation on random inputs', async () => {
			const { computeModPow } = loadApis();
			// Deterministic xorshift so failures are reproducible.
			let seed = 0x2545f491;
			const nextHex = (digits: number) => {
				let hex = '';
				for (let i = 0; i < digits; i++) {
					seed ^= seed << 13;
					seed ^= seed >>> 17;
					seed ^= seed << 5;
					hex += ((seed >>> 0) % 16).toString(16);
				}

				return hex.replace(/^0+(?=.)/, '');
			};
			const referenceModPow = (b: bigint, e: bigint, m: bigint) => {
				let result = BigInt(1) % m;
				let base = ((b % m) + m) % m;
				for (let x = e; x > BigInt(0); x /= BigInt(2)) {
					if (x % BigInt(2) === BigInt(1)) result = (result * base) % m;
					base = (base * base) % m;
				}

				return result;
			};

			for (const digits of [1, 2, 7, 16, 63, 128, 256, 768]) {
				for (let i = 0; i < 8; i++) {
					const base = nextHex(digits * 2);
					const exponent = nextHex(Math.min(digits, 64));
					const divisor = nextHex(digits).replace(/^0$/, '1');
					const expected = referenceModPow(
						BigInt(`0x${base}`),
						BigInt(`0x${exponent}`),
						BigInt(`0x${divisor}`),
					).toString(16);
					expect(await computeModPow({ base, exponent, divisor })).toBe(
						expected,
					);
				}
			}
		});

		it.each([
			['a non-hex value', { base: 'xyz', exponent: '1', divisor: '7' }],
			['an empty value', { base: '', exponent: '1', divisor: '7' }],
			['a missing value', { base: '2', exponent: '1' }],
			['a negative exponent', { base: '2', exponent: '-1', divisor: '7' }],
			['a zero divisor', { base: '2', exponent: '1', divisor: '0' }],
			['a negative divisor', { base: '2', exponent: '1', divisor: '-7' }],
		])('rejects %s', async (_, payload) => {
			const { computeModPow } = loadApis();
			await expect(computeModPow(payload as any)).rejects.toThrow(Error);
		});
	});

	describe('computeS', () => {
		it.each(srpVectors.computeS.map((v, i) => [i, v] as const))(
			'matches the known answer for vector %i',
			async (_, { expected, ...payload }) => {
				const { computeS } = loadApis();
				expect(await computeS(payload)).toBe(expected);
			},
		);

		it('rejects an invalid payload', async () => {
			const { computeS } = loadApis();
			await expect(
				computeS({ g: '2', x: '1', k: '1', a: '1', b: 'not-hex', u: '1' }),
			).rejects.toThrow(Error);
		});
	});

	describe('getDeviceName', () => {
		it('returns the device model on Android', async () => {
			mockPlatform.OS = 'android';
			mockPlatform.constants = { Model: 'sdk_gphone64_arm64' };
			const { getDeviceName } = loadApis();
			expect(await getDeviceName()).toBe('sdk_gphone64_arm64');
		});

		it('returns a generic name on iPhone', async () => {
			mockPlatform.isPad = false;
			const { getDeviceName } = loadApis();
			expect(await getDeviceName()).toBe('iPhone');
		});

		it('returns a generic name on iPad', async () => {
			mockPlatform.isPad = true;
			const { getDeviceName } = loadApis();
			expect(await getDeviceName()).toBe('iPad');
		});

		it('falls back to the platform name when no model is reported', async () => {
			mockPlatform.OS = 'android';
			mockPlatform.constants = {};
			const { getDeviceName } = loadApis();
			expect(await getDeviceName()).toBe('android');
		});
	});
});
