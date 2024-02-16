// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Sha256 } from '@aws-crypto/sha256-js';
import {
	generateRandomString,
	getCrypto,
	base64Encoder,
} from '@aws-amplify/core/internals/utils';
import {
	generateCodeVerifier,
	generateState,
} from '../../../../../src/providers/cognito/utils/oauth/index';

jest.mock('@aws-crypto/sha256-js');
jest.mock('@aws-amplify/core/internals/utils');

const mockSha256 = Sha256 as jest.Mock;
const mockBase64EncoderConvert = base64Encoder.convert as jest.Mock;
const mockGenerateRandomString = generateRandomString as jest.Mock;
const mockGetCrypto = getCrypto as jest.Mock;

const mockRandomBytes = [
	126, 74, 81, 117, 32, 12, 27, 133, 157, 28, 92, 93, 174, 166, 131, 10, 205,
	105, 128, 13, 249, 254, 236, 198, 189, 122, 164, 33, 178, 200, 177, 26, 165,
	123, 80, 64, 158, 74, 249, 185, 19, 188, 215, 72, 196, 229, 35, 90, 65, 129,
	150, 143, 40, 234, 81, 129, 115, 62, 94, 164, 254, 221, 143, 204, 116, 240,
	250, 149, 106, 25, 159, 89, 39, 226, 115, 247, 9, 252, 235, 213, 125, 122,
	105, 164, 151, 139, 220, 190, 192, 77, 122, 30, 232, 10, 50, 81, 170, 64, 1,
	95, 243, 224, 68, 188, 87, 57, 231, 207, 81, 217, 57, 113, 251, 140, 59, 164,
	200, 160, 48, 50, 120, 212, 81, 188, 87, 224, 61, 143,
];
const mockCodeVerifier =
	'CMT3gMbJhcefyqHKTrENBGyMD8oh2O1ap9SCiMB9TCdKKrjcDFaTowTF1AgoGjTS22CZsZjbno19JExbB8robPiEGP8euKyTuCBh5mGCZ5tVTf5zDQ7oOkwy6aTCZm9T';

describe('generateState', () => {
	it('invokes generateRandomString with length parameter value 32', () => {
		generateState();
		expect(mockGenerateRandomString).toHaveBeenCalledWith(32);
	});
});

describe('generateCodeVerifier', () => {
	const OriginalUint8Array = global.Uint8Array;
	const mockUint8Array = jest.fn();
	const mockSha256DigestSync = jest.fn();
	const mockSha256Update = jest.fn();
	const mockCrypto = {
		getRandomValues: jest.fn(),
	};

	beforeAll(() => {
		global.Uint8Array = mockUint8Array as any;
	});

	afterAll(() => {
		global.Uint8Array = OriginalUint8Array;
	});

	beforeEach(() => {
		mockCrypto.getRandomValues.mockReset();
		mockUint8Array.mockReset();
		mockGetCrypto.mockReturnValue(mockCrypto);
		mockUint8Array.mockImplementation(length => new OriginalUint8Array(length));
		mockSha256.mockImplementation(() => ({
			update: mockSha256Update,
			digestSync: mockSha256DigestSync,
		}));
	});

	it('invokes getCrypto() to get crypto from the globals', () => {
		generateCodeVerifier(32);
		expect(mockGetCrypto).toHaveBeenCalled();
	});

	it('invokes getRandomValues with the correct parameter', () => {
		generateCodeVerifier(128);

		expect(mockUint8Array).toHaveBeenCalledWith(128);
		expect(mockCrypto.getRandomValues).toHaveBeenCalledTimes(1);

		const param = mockCrypto.getRandomValues.mock.calls[0][0];

		expect(param instanceof OriginalUint8Array).toBe(true);
		expect(param.length).toBe(128);
	});

	it('returns the correct codeVerifier and code challenge', () => {
		mockCrypto.getRandomValues.mockImplementationOnce((buffer: Uint8Array) => {
			for (let i = 0; i < buffer.length; i++) {
				buffer[i] = mockRandomBytes[i];
			}
		});
		const codeVerifier = generateCodeVerifier(128);
		expect(codeVerifier.value).toEqual(mockCodeVerifier);
		expect(codeVerifier.method).toBe('S256');
		expect(typeof codeVerifier.toCodeChallenge).toBe('function');
	});

	it('generates code challenge', () => {
		mockCrypto.getRandomValues.mockImplementationOnce((buffer: Uint8Array) => {
			for (let i = 0; i < buffer.length; i++) {
				buffer[i] = mockRandomBytes[i];
			}
		});
		mockSha256DigestSync.mockReturnValueOnce('digest-result');
		mockBase64EncoderConvert.mockReturnValueOnce('base64EncodedCodeChallenge');

		const codeVerifier = generateCodeVerifier(128);
		const result = codeVerifier.toCodeChallenge();

		expect(mockSha256Update).toHaveBeenCalledWith(mockCodeVerifier);
		expect(mockSha256DigestSync).toHaveBeenCalledTimes(1);
		expect(mockBase64EncoderConvert).toHaveBeenCalledWith('digest-result', {
			urlSafe: true,
		});
		expect(result).toEqual('base64EncodedCodeChallenge');

		const resultAgain = codeVerifier.toCodeChallenge();

		expect(resultAgain).toEqual('base64EncodedCodeChallenge');
	});

	it('removes padding char = from the encoded codeChallenge', () => {
		mockSha256DigestSync.mockReturnValueOnce('digest-result');
		mockBase64EncoderConvert.mockReturnValueOnce(
			'base64EncodedCodeChallenge==',
		);
		const codeVerifier = generateCodeVerifier(128);
		const result = codeVerifier.toCodeChallenge();
		expect(result).toEqual('base64EncodedCodeChallenge');
	});
});
