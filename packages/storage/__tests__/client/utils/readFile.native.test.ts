// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Buffer } from 'buffer';

import { readFile } from '../../../src/client/utils/readFile.native';

jest.mock('buffer', () => ({
	Buffer: {
		from: jest.fn(() => new Uint8Array()),
	},
}));

describe('client/utils/readFile.native', () => {
	let mockFileReader: any;

	beforeEach(() => {
		mockFileReader = {
			onload: null,
			onabort: null,
			onerror: null,
			readAsArrayBuffer: jest.fn(),
			readAsDataURL: jest.fn(),
			result: null,
		};

		(global as any).FileReader = jest.fn(() => mockFileReader);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('resolves with ArrayBuffer when readAsArrayBuffer is supported', async () => {
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

	it('falls back to readAsDataURL + Buffer when readAsArrayBuffer throws (RN 0.71 workaround)', async () => {
		const blob = new Blob(['content']);
		const base64 = 'base64data';
		const dataURL = `data:application/octet-stream;base64,${base64}`;

		mockFileReader.readAsArrayBuffer.mockImplementation(() => {
			throw new Error('readAsArrayBuffer not supported');
		});
		mockFileReader.readAsDataURL.mockImplementation(() => {
			mockFileReader.result = dataURL;
			mockFileReader.onload();
		});

		await readFile(blob);

		expect(mockFileReader.readAsArrayBuffer).toHaveBeenCalledWith(blob);
		expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(blob);
		expect(Buffer.from).toHaveBeenCalledWith(base64, 'base64');
	});

	it('rejects with "Read aborted" when onabort fires', async () => {
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
});
