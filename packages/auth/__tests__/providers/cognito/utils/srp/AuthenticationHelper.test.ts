// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { BigInteger } from '../../../../../src/providers/cognito/utils/srp/BigInteger';
import { AuthenticationHelper } from '../../../../../src/providers/cognito/utils/srp/AuthenticationHelper';
import {
	calculateS,
	calculateU,
} from '../../../../../src/providers/cognito/utils/srp/calculate';
import { getHashFromData } from '../../../../../src/providers/cognito/utils/srp/getHashFromData';
import { getHashFromHex } from '../../../../../src/providers/cognito/utils/srp/getHashFromHex';
import { getHkdfKey } from '../../../../../src/providers/cognito/utils/srp/getHkdfKey';
import { getPaddedHex } from '../../../../../src/providers/cognito/utils/srp/getPaddedHex';
import { getRandomString } from '../../../../../src/providers/cognito/utils/srp/getRandomString';
import { textEncoder } from '../../../../../src/providers/cognito/utils/textEncoder';

jest.mock('../../../../../src/providers/cognito/utils/srp/calculate');
jest.mock('../../../../../src/providers/cognito/utils/srp/getBytesFromHex');
jest.mock('../../../../../src/providers/cognito/utils/srp/getHashFromData');
jest.mock('../../../../../src/providers/cognito/utils/srp/getHashFromHex');
jest.mock('../../../../../src/providers/cognito/utils/srp/getHexFromBytes');
jest.mock('../../../../../src/providers/cognito/utils/srp/getHkdfKey');
jest.mock('../../../../../src/providers/cognito/utils/srp/getPaddedHex');
jest.mock('../../../../../src/providers/cognito/utils/srp/getRandomBytes');
jest.mock('../../../../../src/providers/cognito/utils/srp/getRandomString');
jest.mock('../../../../../src/providers/cognito/utils/textEncoder');

describe('AuthenticationHelper', () => {
	let instance: AuthenticationHelper;
	const a = new BigInteger('a', 16);
	const g = new BigInteger('g', 16);
	const A = new BigInteger('A', 16);
	const N = new BigInteger('N', 16);
	const S = new BigInteger('S', 16);
	const U = new BigInteger('U', 16);
	const randomString = 'random-string';
	// create mocks
	const mockGetHashFromData = getHashFromData as jest.Mock;
	const mockGetPaddedHex = getPaddedHex as jest.Mock;
	const mockGetRandomString = getRandomString as jest.Mock;
	const mockTextEncoderConvert = textEncoder.convert as jest.Mock;

	beforeAll(() => {
		mockGetRandomString.mockReturnValue(randomString);
		mockTextEncoderConvert.mockReturnValue(new Uint8Array());
	});

	beforeEach(() => {
		instance = new AuthenticationHelper({
			userPoolName: 'TestPoolName',
			a,
			g,
			A,
			N,
		});
	});

	afterEach(() => {
		mockGetHashFromData.mockReset();
	});

	describe('getRandomPassword', () => {
		it('should throw as it was not previously defined', () => {
			expect(() => instance.getRandomPassword()).toThrow();
		});
	});

	describe('getSaltToHashDevices', () => {
		it('should throw as it was not previously defined', () => {
			expect(() => {
				instance.getSaltToHashDevices();
			}).toThrow();
		});
	});

	describe('getVerifierDevices', () => {
		it('should throw as it was not previously defined', () => {
			expect(() => instance.getVerifierDevices()).toThrow();
		});
	});

	describe('generateHashDevice', () => {
		const deviceGroupKey = 'device-group-key';
		const username = 'user-name';
		const randomString = 'random-string';
		// create spies
		const modPowSpy = jest.spyOn(BigInteger.prototype, 'modPow');

		beforeAll(() => {
			mockGetHashFromData.mockReturnValue('hashed-string');
			mockGetPaddedHex.mockReturnValue('padded-hex');
		});

		afterEach(() => {
			modPowSpy.mockReset();
		});

		afterAll(() => {
			mockGetHashFromData.mockReset();
			mockGetPaddedHex.mockReset();
		});

		it('should instantiate the verifierDevices of the instance', async () => {
			await instance.generateHashDevice(deviceGroupKey, username);

			expect(mockGetHashFromData).toHaveBeenCalledWith(
				`${deviceGroupKey}${username}:${randomString}`,
			);
			expect(instance.getVerifierDevices()).toBeDefined();
		});

		it('should throw an error if modPow fails', async () => {
			modPowSpy.mockImplementation((_: any, __: any, callback: any) => {
				callback(new Error());
			});

			await expect(
				instance.generateHashDevice(deviceGroupKey, username),
			).rejects.toThrow();
		});
	});

	describe('getPasswordAuthenticationKey', () => {
		const username = 'username';
		const password = 'password';
		const usernamePasswordHash = `${username}-${password}-hash`;
		const serverBValue = new BigInteger('server-b-value', 16);
		const salt = new BigInteger('salt', 16);
		const hkdfKey = new Uint8Array(Buffer.from('hkdf-key'));
		// create mocks
		const mockCalculateS = calculateS as jest.Mock;
		const mockCalculateU = calculateU as jest.Mock;
		const mockGetHashFromHex = getHashFromHex as jest.Mock;
		const mockGetHkdfKey = getHkdfKey as jest.Mock;

		beforeAll(() => {
			mockGetHashFromData.mockReturnValue(usernamePasswordHash);
			mockGetHashFromHex.mockReturnValue('foo');
			mockGetHkdfKey.mockReturnValue(hkdfKey);
			mockGetPaddedHex.mockReturnValue('');
		});

		beforeEach(() => {
			mockCalculateS.mockReturnValue(S);
			mockCalculateU.mockReturnValue(U);
		});

		afterEach(() => {
			mockCalculateS.mockReset();
			mockCalculateU.mockReset();
			mockGetHashFromHex.mockClear();
			mockGetPaddedHex.mockClear();
		});

		it('should return hkdfKey', async () => {
			expect(
				await instance.getPasswordAuthenticationKey({
					username,
					password,
					serverBValue,
					salt,
				}),
			).toBe(hkdfKey);
			expect(mockCalculateU).toHaveBeenCalledWith({ A, B: serverBValue });
			expect(mockGetPaddedHex).toHaveBeenCalledWith(salt);
			expect(mockGetHashFromHex).toHaveBeenCalledWith(usernamePasswordHash);
			expect(mockCalculateS).toHaveBeenCalledWith({
				a,
				g,
				k: expect.any(BigInteger),
				x: expect.any(BigInteger),
				B: serverBValue,
				N,
				U,
			});
		});

		it('should throw an error if calculateU fails', async () => {
			mockCalculateU.mockImplementation(() => {
				throw new Error();
			});
			await expect(
				instance.getPasswordAuthenticationKey({
					username,
					password,
					serverBValue,
					salt,
				}),
			).rejects.toThrow();
		});

		it('should throw an error if calculateS fails', async () => {
			mockCalculateS.mockImplementation(() => {
				throw new Error();
			});
			await expect(
				instance.getPasswordAuthenticationKey({
					username,
					password,
					serverBValue,
					salt,
				}),
			).rejects.toThrow();
		});

		it('should throw an error if it receives a bad server value', async () => {
			await expect(
				instance.getPasswordAuthenticationKey({
					username,
					password,
					serverBValue: BigInteger.ZERO,
					salt,
				}),
			).rejects.toThrow('B cannot be zero');
		});
	});
});
