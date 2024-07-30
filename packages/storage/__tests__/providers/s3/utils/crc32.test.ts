// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Blob as BlobPolyfill, File as FilePolyfill } from 'node:buffer';
import { WritableStream as WritableStreamPolyfill } from 'node:stream/web';
import { TextDecoder } from 'node:util';

import { calculateContentCRC32 } from '../../../../src/providers/s3/utils/crc32';

global.Blob = BlobPolyfill as any;
global.File = FilePolyfill as any;
global.WritableStream = WritableStreamPolyfill as any;
global.TextDecoder = TextDecoder as any;

const MB = 1024 * 1024;
const getBlob = (size: number) => new Blob(['1'.repeat(size)]);
const decoder = new TextDecoder();

describe('calculate crc32', () => {
	describe.each([
		{
			type: 'file',
			size: '8MB',
			data: new File([getBlob(8 * MB)], 'someName'),
			results: {
				checksum: '/YBlgg==',
				checksumArrayBuffer: new Uint8Array([253, 128, 101, 130]).buffer,
				seed: 4253050242,
			},
		},
		{
			type: 'blob',
			size: '8MB',
			data: getBlob(8 * MB),
			results: {
				checksum: '/YBlgg==',
				checksumArrayBuffer: new Uint8Array([253, 128, 101, 130]).buffer,
				seed: 4253050242,
			},
		},
		{
			type: 'string',
			size: '8MB',
			data: 'Ü'.repeat(4 * MB),
			results: {
				checksum: 'dPB9Lw==',
				checksumArrayBuffer: new Uint8Array([116, 240, 125, 47]).buffer,
				seed: 1961917743,
			},
		},
		{
			type: 'arrayBuffer',
			size: '8MB',
			data: new ArrayBuffer(8 * MB),
			results: {
				checksum: 'GtK8RQ==',
				checksumArrayBuffer: new Uint8Array([26, 210, 188, 69]).buffer,
				seed: 450018373,
			},
		},
		{
			type: 'arrayBufferView',
			size: '8MB',
			data: new Uint8Array(8 * MB),
			results: {
				checksum: 'GtK8RQ==',
				checksumArrayBuffer: new Uint8Array([26, 210, 188, 69]).buffer,
				seed: 450018373,
			},
		},
		{
			type: 'file',
			size: '80MB',
			data: new File([getBlob(8 * MB * 10)], 'someName'),
			results: {
				checksum: 'jzkQ3w==',
				checksumArrayBuffer: new Uint8Array([143, 57, 16, 223]).buffer,
				seed: 2402881759,
			},
		},
		{
			type: 'blob',
			size: '80MB',
			data: getBlob(8 * MB * 10),
			results: {
				checksum: 'jzkQ3w==',
				checksumArrayBuffer: new Uint8Array([143, 57, 16, 223]).buffer,
				seed: 2402881759,
			},
		},
		{
			type: 'string',
			size: '80MB',
			data: 'Ü'.repeat(4 * MB * 10),
			results: {
				checksum: 'N2iSyg==',
				checksumArrayBuffer: new Uint8Array([55, 104, 146, 202]).buffer,
				seed: 929600202,
			},
		},
		{
			type: 'arrayBuffer',
			size: '80MB',
			data: new ArrayBuffer(8 * MB * 10),
			results: {
				checksum: 'KouG9w==',
				checksumArrayBuffer: new Uint8Array([42, 139, 134, 247]).buffer,
				seed: 713787127,
			},
		},
		{
			type: 'arrayBufferView',
			size: '80MB',
			data: new Uint8Array(8 * MB * 10),
			results: {
				checksum: 'KouG9w==',
				checksumArrayBuffer: new Uint8Array([42, 139, 134, 247]).buffer,
				seed: 713787127,
			},
		},
	])('output for data type of $type with size $size', ({ data, results }) => {
		it('should have correct checksumArrayBuffer', async () => {
			console.log((await calculateContentCRC32(data))?.checksumArrayBuffer);
			expect(
				decoder.decode(
					(await calculateContentCRC32(data))?.checksumArrayBuffer,
				),
			).toEqual(decoder.decode(results.checksumArrayBuffer));
		});
		it('should have correct checksum', async () => {
			expect((await calculateContentCRC32(data))?.checksum).toEqual(
				results.checksum,
			);
		});
		it('should have correct seed', async () => {
			expect((await calculateContentCRC32(data))?.seed).toEqual(results.seed);
		});
	});
});
