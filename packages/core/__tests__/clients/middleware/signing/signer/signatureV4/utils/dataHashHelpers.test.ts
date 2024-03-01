// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	getHashedData,
	getHashedDataAsHex,
} from '../../../../../../../src/clients/middleware/signing/signer/signatureV4/utils/dataHashHelpers';

describe('dataHashHelpers', () => {
	const key = 'hash-key';
	const data = 'hash-data';
	const arrayBuffer = new ArrayBuffer(8);
	const arrayBufferView = new Uint8Array(new ArrayBuffer(8));

	describe('getHashedData', () => {
		test('returns hashed data from a key and data', () => {
			expect(getHashedData(key, data)).toStrictEqual(
				new Uint8Array([
					232, 228, 217, 152, 156, 118, 166, 42, 124, 217, 129, 99, 56, 163,
					190, 131, 62, 148, 54, 170, 101, 55, 158, 118, 42, 239, 245, 136, 153,
					115, 41, 156,
				]),
			);

			expect(getHashedData(arrayBuffer, arrayBuffer)).toStrictEqual(
				new Uint8Array([
					243, 117, 24, 10, 186, 146, 136, 132, 1, 241, 145, 155, 228, 168, 113,
					90, 98, 118, 59, 101, 193, 193, 14, 29, 8, 88, 232, 29, 77, 111, 159,
					210,
				]),
			);

			expect(getHashedData(arrayBufferView, arrayBufferView)).toStrictEqual(
				new Uint8Array([
					243, 117, 24, 10, 186, 146, 136, 132, 1, 241, 145, 155, 228, 168, 113,
					90, 98, 118, 59, 101, 193, 193, 14, 29, 8, 88, 232, 29, 77, 111, 159,
					210,
				]),
			);
		});

		test('returns hashed data from just data', () => {
			expect(getHashedData(null, data)).toStrictEqual(
				new Uint8Array([
					113, 23, 15, 47, 24, 62, 16, 92, 220, 133, 238, 126, 50, 50, 172, 161,
					24, 87, 60, 247, 83, 37, 49, 75, 190, 87, 74, 159, 224, 95, 47, 233,
				]),
			);
		});
	});

	describe('getHashedDataAsHex', () => {
		test('returns hashed data from a key and data', () => {
			expect(getHashedDataAsHex(key, data)).toStrictEqual(
				'e8e4d9989c76a62a7cd9816338a3be833e9436aa65379e762aeff5889973299c',
			);

			expect(getHashedDataAsHex(arrayBuffer, arrayBuffer)).toStrictEqual(
				'f375180aba92888401f1919be4a8715a62763b65c1c10e1d0858e81d4d6f9fd2',
			);

			expect(
				getHashedDataAsHex(arrayBufferView, arrayBufferView),
			).toStrictEqual(
				'f375180aba92888401f1919be4a8715a62763b65c1c10e1d0858e81d4d6f9fd2',
			);
		});

		test('returns hashed data from just data', () => {
			expect(getHashedDataAsHex(null, data)).toStrictEqual(
				'71170f2f183e105cdc85ee7e3232aca118573cf75325314bbe574a9fe05f2fe9',
			);
		});
	});
});
