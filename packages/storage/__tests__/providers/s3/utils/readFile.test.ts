import { readFile } from '../../../../src/providers/s3/utils/readFile';

describe('readFile', () => {
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

	it('should read file as ArrayBuffer when supported', async () => {
		const mockFile = new Blob(['test content']);
		const mockArrayBuffer = new ArrayBuffer(8);

		mockFileReader.readAsArrayBuffer.mockImplementation(() => {
			mockFileReader.result = mockArrayBuffer;
			mockFileReader.onload();
		});

		const result = await readFile(mockFile);

		expect(mockFileReader.readAsArrayBuffer).toHaveBeenCalledWith(mockFile);
		expect(result).toBe(mockArrayBuffer);
	});

	it('should reject when read is aborted', async () => {
		const mockFile = new Blob(['test content']);

		mockFileReader.readAsArrayBuffer.mockImplementation(() => {
			mockFileReader.onabort();
		});

		await expect(readFile(mockFile)).rejects.toThrow('Read aborted');
	});

	it('should reject when an error occurs during reading', async () => {
		const mockFile = new Blob(['test content']);
		const mockError = new Error('Read error');

		mockFileReader.readAsArrayBuffer.mockImplementation(() => {
			mockFileReader.error = mockError;
			mockFileReader.onerror();
		});

		await expect(readFile(mockFile)).rejects.toThrow(mockError);
	});

	it('should handle empty files', async () => {
		const mockFile = new Blob([]);
		const mockArrayBuffer = new ArrayBuffer(0);

		mockFileReader.readAsArrayBuffer.mockImplementation(() => {
			mockFileReader.result = mockArrayBuffer;
			mockFileReader.onload();
		});

		const result = await readFile(mockFile);

		expect(result).toBeInstanceOf(ArrayBuffer);
		expect(result.byteLength).toBe(0);
	});

	it('should handle large files', async () => {
		const largeContent = 'a'.repeat(1024 * 1024 * 10); // 10MB of data
		const mockFile = new Blob([largeContent]);
		const mockArrayBuffer = new ArrayBuffer(1024 * 1024 * 10);

		mockFileReader.readAsArrayBuffer.mockImplementation(() => {
			mockFileReader.result = mockArrayBuffer;
			mockFileReader.onload();
		});

		const result = await readFile(mockFile);

		expect(result).toBe(mockArrayBuffer);
		expect(result.byteLength).toBe(1024 * 1024 * 10);
	});
});
