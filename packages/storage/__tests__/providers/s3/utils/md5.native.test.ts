import { Buffer } from 'buffer';

import { Md5 } from '@smithy/md5-js';

import { calculateContentMd5 } from '../../../../src/providers/s3/utils/md5.native';
import { toBase64 } from '../../../../src/providers/s3/utils/client/utils';

jest.mock('@smithy/md5-js');
jest.mock('../../../../src/providers/s3/utils/client/utils');
jest.mock('buffer');

interface MockFileReader {
	error?: any;
	result?: any;
	onload?(): void;
	onabort?(): void;
	onerror?(): void;
	readAsArrayBuffer?(): void;
	readAsDataURL?(): void;
}

// The FileReader in React Native 0.71 did not support `readAsArrayBuffer`. This native implementation accomodates this
// by attempting to use `readAsArrayBuffer` and changing the file reading strategy if it throws an error.
// TODO: This file should be removable when we drop support for React Native 0.71
describe('calculateContentMd5 (native)', () => {
	const stringContent = 'string-content';
	const base64data = 'base-64-data';
	const fileReaderResult = new ArrayBuffer(8);
	const fileReaderBase64Result = `data:foo/bar;base64,${base64data}`;
	const fileReaderError = new Error();
	// assert mocks
	const mockBufferFrom = Buffer.from as jest.Mock;
	const mockToBase64 = toBase64 as jest.Mock;
	const mockMd5 = Md5 as jest.Mock;
	// create mocks
	const mockSuccessfulFileReader: MockFileReader = {
		readAsArrayBuffer: jest.fn(() => {
			mockSuccessfulFileReader.result = fileReaderResult;
			mockSuccessfulFileReader.onload?.();
		}),
	};
	const mockAbortedFileReader: MockFileReader = {
		readAsArrayBuffer: jest.fn(() => {
			mockAbortedFileReader.onabort?.();
		}),
	};
	const mockFailedFileReader: MockFileReader = {
		readAsArrayBuffer: jest.fn(() => {
			mockFailedFileReader.error = fileReaderError;
			mockFailedFileReader.onerror?.();
		}),
	};
	const mockPartialFileReader: MockFileReader = {
		readAsArrayBuffer: jest.fn(() => {
			throw new Error('Not implemented');
		}),
		readAsDataURL: jest.fn(() => {
			mockPartialFileReader.result = fileReaderBase64Result;
			mockPartialFileReader.onload?.();
		}),
	};

	beforeAll(() => {
		mockBufferFrom.mockReturnValue(fileReaderResult);
	});

	afterEach(() => {
		jest.clearAllMocks();
		mockMd5.mockReset();
	});

	it('calculates MD5 for content type: string', async () => {
		await calculateContentMd5(stringContent);
		const [mockMd5Instance] = mockMd5.mock.instances;
		expect(mockMd5Instance.update.mock.calls[0][0]).toBe(stringContent);
		expect(mockToBase64).toHaveBeenCalled();
	});

	it.each([
		{ type: 'ArrayBuffer view', content: new Uint8Array() },
		{ type: 'ArrayBuffer', content: new ArrayBuffer(8) },
		{ type: 'Blob', content: new Blob([stringContent]) },
	])('calculates MD5 for content type: $type', async ({ content }) => {
		Object.defineProperty(global, 'FileReader', {
			writable: true,
			value: jest.fn(() => mockSuccessfulFileReader),
		});
		await calculateContentMd5(content);
		const [mockMd5Instance] = mockMd5.mock.instances;
		expect(mockMd5Instance.update.mock.calls[0][0]).toBe(fileReaderResult);
		expect(mockSuccessfulFileReader.readAsArrayBuffer).toHaveBeenCalled();
		expect(mockToBase64).toHaveBeenCalled();
	});

	it('rejects on file reader abort', async () => {
		Object.defineProperty(global, 'FileReader', {
			writable: true,
			value: jest.fn(() => mockAbortedFileReader),
		});
		await expect(
			calculateContentMd5(new Blob([stringContent])),
		).rejects.toThrow('Read aborted');
		expect(mockAbortedFileReader.readAsArrayBuffer).toHaveBeenCalled();
		expect(mockToBase64).not.toHaveBeenCalled();
	});

	it('rejects on file reader error', async () => {
		Object.defineProperty(global, 'FileReader', {
			writable: true,
			value: jest.fn(() => mockFailedFileReader),
		});
		await expect(
			calculateContentMd5(new Blob([stringContent])),
		).rejects.toThrow(fileReaderError);
		expect(mockFailedFileReader.readAsArrayBuffer).toHaveBeenCalled();
		expect(mockToBase64).not.toHaveBeenCalled();
	});

	it('tries again using a different strategy if readAsArrayBuffer is unavailable', async () => {
		Object.defineProperty(global, 'FileReader', {
			writable: true,
			value: jest.fn(() => mockPartialFileReader),
		});
		await calculateContentMd5(new Blob([stringContent]));
		const [mockMd5Instance] = mockMd5.mock.instances;
		expect(mockMd5Instance.update.mock.calls[0][0]).toBe(fileReaderResult);
		expect(mockPartialFileReader.readAsDataURL).toHaveBeenCalled();
		expect(mockBufferFrom).toHaveBeenCalledWith(base64data, 'base64');
		expect(mockToBase64).toHaveBeenCalled();
	});
});
