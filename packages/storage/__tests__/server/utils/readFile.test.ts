// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFile } from '../../../src/server/utils/readFile';

describe('server/utils/readFile', () => {
	it('delegates to Blob.arrayBuffer()', async () => {
		const buffer = new ArrayBuffer(12);
		const blob = {
			arrayBuffer: jest.fn().mockResolvedValue(buffer),
		} as unknown as Blob;

		const result = await readFile(blob);

		expect(blob.arrayBuffer).toHaveBeenCalledTimes(1);
		expect(result).toBe(buffer);
	});

	it('reads real Blob content correctly (via arrayBuffer())', async () => {
		// Use a stand-in that exposes arrayBuffer(), since jsdom's Blob does not
		// implement arrayBuffer() — the real Node Blob does, which is what runs
		// in production.
		const payload = new Uint8Array([104, 101, 108, 108, 111]); // "hello"
		const blob = {
			arrayBuffer: jest.fn().mockResolvedValue(payload.buffer),
		} as unknown as Blob;

		const result = await readFile(blob);

		expect(blob.arrayBuffer).toHaveBeenCalled();
		expect(new Uint8Array(result)).toEqual(payload);
	});

	it('handles empty Blob (zero-length ArrayBuffer)', async () => {
		const blob = {
			arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
		} as unknown as Blob;

		const result = await readFile(blob);

		expect(result.byteLength).toBe(0);
	});

	it('propagates rejection from Blob.arrayBuffer()', async () => {
		const blob = {
			arrayBuffer: jest.fn().mockRejectedValue(new Error('read failed')),
		} as unknown as Blob;

		await expect(readFile(blob)).rejects.toThrow('read failed');
	});
});
