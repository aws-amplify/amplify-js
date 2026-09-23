// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFile } from '../../../src/client/utils/readFile';

describe('client/utils/readFile', () => {
	let mockFileReader: any;

	beforeEach(() => {
		mockFileReader = {
			onload: null,
			onabort: null,
			onerror: null,
			readAsArrayBuffer: jest.fn(),
			result: null,
		};

		(global as any).FileReader = jest.fn(() => mockFileReader);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('resolves with the ArrayBuffer produced by FileReader', async () => {
		const blob = new Blob(['content']);
		const buffer = new ArrayBuffer(8);

		mockFileReader.readAsArrayBuffer.mockImplementation(() => {
			mockFileReader.result = buffer;
			mockFileReader.onload();
		});

		const result = await readFile(blob);

		expect(mockFileReader.readAsArrayBuffer).toHaveBeenCalledWith(blob);
		expect(result).toBe(buffer);
	});

	it('rejects with "Read aborted" when FileReader onabort fires', async () => {
		const blob = new Blob(['content']);

		mockFileReader.readAsArrayBuffer.mockImplementation(() => {
			mockFileReader.onabort();
		});

		await expect(readFile(blob)).rejects.toThrow('Read aborted');
	});

	it('rejects with the FileReader error when onerror fires', async () => {
		const blob = new Blob(['content']);
		const err = new Error('boom');

		mockFileReader.readAsArrayBuffer.mockImplementation(() => {
			mockFileReader.error = err;
			mockFileReader.onerror();
		});

		await expect(readFile(blob)).rejects.toThrow(err);
	});

	it('handles empty blobs', async () => {
		const blob = new Blob([]);
		const buffer = new ArrayBuffer(0);

		mockFileReader.readAsArrayBuffer.mockImplementation(() => {
			mockFileReader.result = buffer;
			mockFileReader.onload();
		});

		const result = await readFile(blob);

		expect(result).toBe(buffer);
		expect(result.byteLength).toBe(0);
	});
});
