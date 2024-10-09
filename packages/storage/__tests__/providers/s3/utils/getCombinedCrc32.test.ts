// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Blob as BlobPolyfill, File as FilePolyfill } from 'node:buffer';
import { WritableStream as WritableStreamPolyfill } from 'node:stream/web';
import {
	TextDecoder as TextDecoderPolyfill,
	TextEncoder as TextEncoderPolyfill,
} from 'node:util';

import { getCombinedCrc32 } from '../../../../src/providers/s3/utils/getCombinedCrc32';
import { byteLength } from '../../../../src/providers/s3/apis/internal/uploadData/byteLength';

global.Blob = BlobPolyfill as any;
global.File = FilePolyfill as any;
global.WritableStream = WritableStreamPolyfill as any;
global.TextEncoder = TextEncoderPolyfill as any;
global.TextDecoder = TextDecoderPolyfill as any;

const MB = 1024 * 1024;
const getBlob = (size: number) => new Blob(['1'.repeat(size)]);
const encoder = new TextEncoder();

describe('calculate crc32', () => {
	describe.each([
		{
			type: 'file',
			size: '4B',
			data: new File(['data'], 'someName'),
			expected: {
				checksum: 'wu1R0Q==-1',
			},
		},
		{
			type: 'blob',
			size: '4B',
			data: new Blob(['data']),
			expected: {
				checksum: 'wu1R0Q==-1',
			},
		},
		{
			type: 'string',
			size: '4B',
			data: 'data',
			expected: {
				checksum: 'wu1R0Q==-1',
			},
		},
		{
			type: 'arrayBuffer',
			size: '4B',
			data: new Uint8Array(encoder.encode('data')).buffer,
			expected: {
				checksum: 'wu1R0Q==-1',
			},
		},
		{
			type: 'arrayBufferView',
			size: '4B',
			data: new DataView(encoder.encode('1234 data 5678').buffer, 5, 4),
			expected: {
				checksum: 'wu1R0Q==-1',
			},
		},
		{
			type: 'file',
			size: '8MB',
			data: new File([getBlob(8 * MB)], 'someName'),
			expected: {
				checksum: 'hwOICA==-2',
			},
		},
		{
			type: 'blob',
			size: '8MB',
			data: getBlob(8 * MB),
			expected: {
				checksum: 'hwOICA==-2',
			},
		},
		{
			type: 'string',
			size: '8MB',
			data: '1'.repeat(8 * MB),
			expected: {
				checksum: 'hwOICA==-2',
			},
		},
		{
			type: 'arrayBuffer',
			size: '8MB',
			data: new Uint8Array(encoder.encode('1'.repeat(8 * MB))).buffer,
			expected: {
				checksum: 'hwOICA==-2',
			},
		},
		{
			type: 'arrayBufferView',
			size: '8MB',
			data: encoder.encode('1'.repeat(8 * MB)),
			expected: {
				checksum: 'hwOICA==-2',
			},
		},
	])('output for data type of $type with size $size', ({ data, expected }) => {
		it('should match expected checksum results', async () => {
			expect((await getCombinedCrc32(data, byteLength(data)))!).toEqual(
				expected.checksum,
			);
		});
	});
});
