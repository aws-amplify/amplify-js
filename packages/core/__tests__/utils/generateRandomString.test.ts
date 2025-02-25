// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { generateRandomString } from '../../src/libraryUtils';

describe('generateRandomString', () => {
	const mockRandomValues = new Uint8Array([
		144, 247, 102, 114, 51, 221, 175, 4, 120, 255, 176, 200, 83, 164, 117, 73,
		29, 118, 5, 58, 78, 227, 239, 199, 187, 43, 26, 73, 211, 38, 79, 208,
	]);
	const getRandomValuesSpy = jest.spyOn(crypto, 'getRandomValues');

	beforeAll(() => {
		// Mock crypto.getRandomValues
		getRandomValuesSpy.mockImplementation(bufferView => {
			if (!bufferView) {
				return null;
			}
			const array = new Uint8Array(bufferView.buffer);
			for (let i = 0; i < array.byteLength; i++) {
				array[i] = mockRandomValues[i];
			}

			return array;
		});
	});

	afterEach(() => {
		getRandomValuesSpy.mockClear();
	});

	it('generates a string of the specified length', () => {
		const expectedLength = 10;
		expect(generateRandomString(expectedLength)).toHaveLength(expectedLength);
	});

	it('calls crypto.getRandomValues with Uint8Array', () => {
		generateRandomString(5);
		expect(crypto.getRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array));
	});

	it('uses only characters from the charset', () => {
		const result = generateRandomString(20);
		const charset =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		expect(result).toMatch(new RegExp(`^[${charset}]+$`));
	});

	it('generates random strings with calculated indexes (num % STATE_CHARSET.length)', () => {
		expect(generateRandomString(32)).toStrictEqual(
			'U9o0zjzE6H0OVo3Ld4F6Qp1NBraLZmRW',
		);
	});
});
