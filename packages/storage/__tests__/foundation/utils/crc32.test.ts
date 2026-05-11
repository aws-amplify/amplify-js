// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { TextEncoder as TextEncoderPolyfill } from 'node:util';
import { Buffer } from 'node:buffer';

import { calculateContentCRC32 } from '../../../src/foundation/utils/crc32';
import { FoundationContext } from '../../../src/foundation/types';

global.TextEncoder = TextEncoderPolyfill as any;

const MB = 1024 * 1024;
const getBlob = (size: number) => new Blob(['1'.repeat(size)]);
const encoder = new TextEncoder();

/**
 * Build a real foundation context that is self-contained and does not
 * depend on the `client/*` or `server/*` implementations under test
 * elsewhere. `readFile` uses the jsdom `FileReader` available in the test
 * environment; `toBase64` uses Node `Buffer`.
 */
const createTestCtx = (
	overrides: Partial<FoundationContext> = {},
): FoundationContext => ({
	amplify: {} as FoundationContext['amplify'],
	readFile: blob =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				resolve(reader.result as ArrayBuffer);
			};
			reader.onerror = () => {
				reject(reader.error);
			};
			reader.readAsArrayBuffer(blob);
		}),
	toBase64: input =>
		typeof input === 'string'
			? Buffer.from(input, 'utf-8').toString('base64')
			: Buffer.from(input.buffer, input.byteOffset, input.byteLength).toString(
					'base64',
				),
	...overrides,
});

describe('calculateContentCRC32 (foundation)', () => {
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
			const result = await calculateContentCRC32(createTestCtx(), data);
			expect(result).toEqual(expected);
		});
	});

	describe('dependency injection', () => {
		it('should call ctx.readFile for Blob inputs', async () => {
			const ctx = createTestCtx();
			const readFileSpy = jest.spyOn(ctx, 'readFile');

			await calculateContentCRC32(ctx, new Blob(['data']));

			expect(readFileSpy).toHaveBeenCalled();
		});

		it('should NOT call ctx.readFile for ArrayBufferView inputs', async () => {
			const ctx = createTestCtx();
			const readFileSpy = jest.spyOn(ctx, 'readFile');

			// Use a Uint8Array directly, which is an ArrayBufferView and should
			// take the direct (non-readFile) path regardless of which realm's
			// ArrayBuffer backs it.
			await calculateContentCRC32(ctx, new Uint8Array([1, 2, 3, 4]));

			expect(readFileSpy).not.toHaveBeenCalled();
		});

		it('should call ctx.toBase64 exactly once per invocation', async () => {
			const ctx = createTestCtx();
			const toBase64Spy = jest.spyOn(ctx, 'toBase64');

			await calculateContentCRC32(ctx, 'data');

			expect(toBase64Spy).toHaveBeenCalledTimes(1);
		});

		it('should propagate errors thrown by ctx.readFile', async () => {
			const ctx = createTestCtx({
				readFile: jest.fn().mockRejectedValue(new Error('read failed')),
			});

			await expect(
				calculateContentCRC32(ctx, new Blob(['data'])),
			).rejects.toThrow('read failed');
		});
	});

	describe('seed parameter', () => {
		it('should produce different checksums for different seeds', async () => {
			const ctx = createTestCtx();
			const resultSeed0 = await calculateContentCRC32(ctx, 'data', 0);
			const resultSeed1 = await calculateContentCRC32(ctx, 'data', 1);

			expect(resultSeed0).not.toEqual(resultSeed1);
		});

		it('should default seed to 0 when omitted', async () => {
			const ctx = createTestCtx();
			const resultDefault = await calculateContentCRC32(ctx, 'data');
			const resultExplicitZero = await calculateContentCRC32(ctx, 'data', 0);

			expect(resultDefault).toEqual(resultExplicitZero);
		});
	});
});
