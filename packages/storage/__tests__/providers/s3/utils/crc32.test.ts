// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { TextEncoder as TextEncoderPolyfill } from 'node:util';

import { calculateContentCRC32 } from '../../../../src/providers/s3/utils/crc32';

global.TextEncoder = TextEncoderPolyfill as any;

const MB = 1024 * 1024;
const getBlob = (size: number) => new Blob(['1'.repeat(size)]);
const encoder = new TextEncoder();

describe('calculate crc32', () => {
	describe.each([
		{
			type: 'file',
			size: '4B',
			data: new File(['data'], 'someName'),
			expected: 'rfPzYw==',
		},
		{
			type: 'blob',
			size: '4B',
			data: new Blob(['data']),
			expected: 'rfPzYw==',
		},
		{
			type: 'string',
			size: '4B',
			data: 'data',
			expected: 'rfPzYw==',
		},
		{
			type: 'arrayBuffer',
			size: '4B',
			data: encoder.encode('data').buffer,
			expected: 'rfPzYw==',
		},
		{
			type: 'arrayBufferView',
			size: '4B',
			data: new DataView(encoder.encode('1234 data 5678').buffer, 5, 4),
			expected: 'rfPzYw==',
		},
		{
			type: 'file',
			size: '8MB',
			data: new File([getBlob(8 * MB)], 'someName'),
			expected: '/YBlgg==',
		},
		{
			type: 'blob',
			size: '8MB',
			data: getBlob(8 * MB),
			expected: '/YBlgg==',
		},
		{
			type: 'string',
			size: '8MB',
			data: '1'.repeat(8 * MB),
			expected: '/YBlgg==',
		},
		{
			type: 'arrayBuffer',
			size: '8MB',
			data: encoder.encode('1'.repeat(8 * MB)).buffer,
			expected: '/YBlgg==',
		},
		{
			type: 'arrayBufferView',
			size: '8MB',
			data: encoder.encode('1'.repeat(8 * MB)),
			expected: '/YBlgg==',
		},
	])('output for data type of $type with size $size', ({ data, expected }) => {
		it('should match expected checksum results', async () => {
			const result = await calculateContentCRC32(data);
			expect(result).toEqual(expected);
		});
	});
});
