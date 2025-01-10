// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { generateRandomString } from '../../src/libraryUtils';

describe('generateRandomString', () => {
	const getRandomValuesSpy = jest.spyOn(crypto, 'getRandomValues');
	beforeAll(() => {
		// Mock crypto.getRandomValues
		getRandomValuesSpy.mockImplementation(bufferView => {
			if (!bufferView) {
				return null;
			}
			const array = new Uint8Array(bufferView.buffer);
			for (let i = 0; i < array.byteLength; i++) {
				array[i] = Math.floor(Math.random() * 256);
			}

			return array;
		});
	});

	afterEach(() => {
		getRandomValuesSpy.mockClear();
	});

	it('generates a string of the specified length', () => {
		const length = 10;
		const result = generateRandomString(length);
		expect(result).toHaveLength(length);
	});

	it('uses only characters from the charset', () => {
		const result = generateRandomString(20);
		const charset =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		expect(result).toMatch(new RegExp(`^[${charset}]+$`));
	});

	it('calls crypto.getRandomValues with Uint8Array', () => {
		generateRandomString(5);
		expect(crypto.getRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array));
	});

	it('generates different strings on subsequent calls', () => {
		const result1 = generateRandomString(10);
		const result2 = generateRandomString(10);
		expect(result1).not.toEqual(result2);
	});
});
