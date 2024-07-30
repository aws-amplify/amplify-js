// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Blob as BlobPolyfill, File as FilePolyfill } from 'node:buffer';
import { WritableStream as WritableStreamPolyfill } from 'node:stream/web';
import {
	TextDecoder as TextDecoderPolyfill,
	TextEncoder as TextEncoderPolyfill,
} from 'node:util';

import { calculateContentCRC32 } from '../../../../src/providers/s3/utils/crc32';

global.Blob = BlobPolyfill as any;
global.File = FilePolyfill as any;
global.WritableStream = WritableStreamPolyfill as any;
global.TextEncoder = TextEncoderPolyfill as any;
global.TextDecoder = TextDecoderPolyfill as any;

const MB = 1024 * 1024;
const getBlob = (size: number) => new Blob(['1'.repeat(size)]);
const encoder = new TextEncoder();
const decoder = new TextDecoder();

describe('calculate crc32', () => {
	describe.each([
		{
			type: 'file',
			size: '4B',
			data: new File(['data'], 'someName'),
			expected: {
				checksum: 'rfPzYw==',
				checksumArrayBuffer: new Uint8Array([173, 243, 243, 99]).buffer,
				seed: 2918445923,
			},
		},
		{
			type: 'blob',
			size: '4B',
			data: new Blob(['data']),
			expected: {
				checksum: 'rfPzYw==',
				checksumArrayBuffer: new Uint8Array([173, 243, 243, 99]).buffer,
				seed: 2918445923,
			},
		},
		{
			type: 'string',
			size: '4B',
			data: 'data',
			expected: {
				checksum: 'rfPzYw==',
				checksumArrayBuffer: new Uint8Array([173, 243, 243, 99]).buffer,
				seed: 2918445923,
			},
		},
		{
			type: 'arrayBuffer',
			size: '4B',
			data: encoder.encode('data').buffer,
			expected: {
				checksum: 'rfPzYw==',
				checksumArrayBuffer: new Uint8Array([173, 243, 243, 99]).buffer,
				seed: 2918445923,
			},
		},
		{
			type: 'arrayBufferView',
			size: '4B',
			data: new DataView(encoder.encode('1234 data 5678').buffer, 5, 4),
			expected: {
				checksum: 'rfPzYw==',
				checksumArrayBuffer: new Uint8Array([173, 243, 243, 99]).buffer,
				seed: 2918445923,
			},
		},
		{
			type: 'file',
			size: '8MB',
			data: new File([getBlob(8 * MB)], 'someName'),
			expected: {
				checksum: '/YBlgg==',
				checksumArrayBuffer: new Uint8Array([253, 128, 101, 130]).buffer,
				seed: 4253050242,
			},
		},
		{
			type: 'blob',
			size: '8MB',
			data: getBlob(8 * MB),
			expected: {
				checksum: '/YBlgg==',
				checksumArrayBuffer: new Uint8Array([253, 128, 101, 130]).buffer,
				seed: 4253050242,
			},
		},
		{
			type: 'string',
			size: '8MB',
			data: '1'.repeat(8 * MB),
			expected: {
				checksum: '/YBlgg==',
				checksumArrayBuffer: new Uint8Array([253, 128, 101, 130]).buffer,
				seed: 4253050242,
			},
		},
		{
			type: 'arrayBuffer',
			size: '8MB',
			data: encoder.encode('1'.repeat(8 * MB)).buffer,
			expected: {
				checksum: '/YBlgg==',
				checksumArrayBuffer: new Uint8Array([253, 128, 101, 130]).buffer,
				seed: 4253050242,
			},
		},
		{
			type: 'arrayBufferView',
			size: '8MB',
			data: encoder.encode('1'.repeat(8 * MB)),
			expected: {
				checksum: '/YBlgg==',
				checksumArrayBuffer: new Uint8Array([253, 128, 101, 130]).buffer,
				seed: 4253050242,
			},
		},
	])('output for data type of $type with size $size', ({ data, expected }) => {
		it('should match expected checksum results', async () => {
			const result = (await calculateContentCRC32(data))!;
			expect(result.checksum).toEqual(expected.checksum);
			expect(result.seed).toEqual(expected.seed);
			expect(decoder.decode(result.checksumArrayBuffer)).toEqual(
				decoder.decode(expected.checksumArrayBuffer),
			);
		});
	});
});
