// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { uploadData } from '../../../../../src/providers/s3/apis';
import { MAX_OBJECT_SIZE } from '../../../../../src/providers/s3/utils/constants';
import { createUploadTask } from '../../../../../src/providers/s3/utils';
import {
	validationErrorMap,
	StorageValidationErrorCode,
} from '../../../../../src/errors/types/validation';
import { putObjectJob } from '../../../../../src/providers/s3/apis/uploadData/putObjectJob';
import { getMultipartUploadHandlers } from '../../../../../src/providers/s3/apis/uploadData/multipart';
import { UploadDataInput, UploadDataWithPathInput } from '../../../../../src';

jest.mock('../../../../../src/providers/s3/utils/');
jest.mock('../../../../../src/providers/s3/apis/uploadData/putObjectJob');
jest.mock('../../../../../src/providers/s3/apis/uploadData/multipart');

const testPath = 'testPath/object';
const mockCreateUploadTask = createUploadTask as jest.Mock;
const mockPutObjectJob = putObjectJob as jest.Mock;
const mockGetMultipartUploadHandlers = (
	getMultipartUploadHandlers as jest.Mock
).mockReturnValue({
	multipartUploadJob: jest.fn(),
	onPause: jest.fn(),
	onResume: jest.fn(),
	onCancel: jest.fn(),
});

/* TODO Remove suite when `key` parameter is removed */
describe('uploadData with key', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('validation', () => {
		it('should throw if data size is too big', async () => {
			const mockUploadInput: UploadDataInput = {
				key: 'key',
				data: { size: MAX_OBJECT_SIZE + 1 } as any,
			};
			expect(() => uploadData(mockUploadInput)).toThrow(
				expect.objectContaining(
					validationErrorMap[StorageValidationErrorCode.ObjectIsTooLarge],
				),
			);
		});

		it('should NOT throw if data size is unknown', async () => {
			uploadData({
				key: 'key',
				data: {} as any,
			});
			expect(mockCreateUploadTask).toHaveBeenCalled();
		});
	});

	describe('use putObject for small uploads', () => {
		const smallData = { size: 5 * 1024 * 1024 } as any;
		it('should use putObject if data size is <= 5MB', async () => {
			uploadData({
				key: 'key',
				data: smallData,
			});
			expect(mockPutObjectJob).toHaveBeenCalled();
			expect(mockGetMultipartUploadHandlers).not.toHaveBeenCalled();
		});

		it('should use uploadTask', async () => {
			mockPutObjectJob.mockReturnValueOnce('putObjectJob');
			mockCreateUploadTask.mockReturnValueOnce('uploadTask');
			const task = uploadData({
				key: 'key',
				data: smallData,
			});
			expect(task).toBe('uploadTask');
			expect(mockCreateUploadTask).toHaveBeenCalledWith(
				expect.objectContaining({
					job: 'putObjectJob',
					onCancel: expect.any(Function),
					isMultipartUpload: false,
				}),
			);
		});
	});

	describe('use multipartUpload for large uploads', () => {
		const biggerData = { size: 5 * 1024 * 1024 + 1 } as any;
		it('should use multipartUpload if data size is > 5MB', async () => {
			uploadData({
				key: 'key',
				data: biggerData,
			});
			expect(mockPutObjectJob).not.toHaveBeenCalled();
			expect(mockGetMultipartUploadHandlers).toHaveBeenCalled();
		});

		it('should use uploadTask', async () => {
			mockCreateUploadTask.mockReturnValueOnce('uploadTask');
			const task = uploadData({
				key: 'key',
				data: biggerData,
			});
			expect(task).toBe('uploadTask');
			expect(mockCreateUploadTask).toHaveBeenCalledWith(
				expect.objectContaining({
					job: expect.any(Function),
					onCancel: expect.any(Function),
					onResume: expect.any(Function),
					onPause: expect.any(Function),
					isMultipartUpload: true,
				}),
			);
		});

		it('should call getMultipartUploadHandlers', async () => {
			uploadData({
				key: 'key',
				data: biggerData,
			});
			expect(mockGetMultipartUploadHandlers).toHaveBeenCalled();
		});
	});
});

describe('uploadData with path', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('validation', () => {
		it('should throw if data size is too big', async () => {
			const mockUploadInput: UploadDataWithPathInput = {
				path: testPath,
				data: { size: MAX_OBJECT_SIZE + 1 } as any,
			};
			expect(() => uploadData(mockUploadInput)).toThrow(
				expect.objectContaining(
					validationErrorMap[StorageValidationErrorCode.ObjectIsTooLarge],
				),
			);
		});

		it('should NOT throw if data size is unknown', async () => {
			uploadData({
				path: testPath,
				data: {} as any,
			});
			expect(mockCreateUploadTask).toHaveBeenCalled();
		});
	});

	describe('use putObject for small uploads', () => {
		const smallData = { size: 5 * 1024 * 1024 } as any;

		test.each([
			{
				path: testPath,
			},
			{
				path: () => testPath,
			},
		])(
			'should use putObject if data size is <= 5MB when path is $path',
			async ({ path }) => {
				const testInput = {
					path,
					data: smallData,
				};

				uploadData(testInput);

				expect(mockPutObjectJob).toHaveBeenCalledWith(
					testInput,
					expect.any(AbortSignal),
					expect.any(Number),
				);
				expect(mockGetMultipartUploadHandlers).not.toHaveBeenCalled();
			},
		);

		it('should use uploadTask', async () => {
			mockPutObjectJob.mockReturnValueOnce('putObjectJob');
			mockCreateUploadTask.mockReturnValueOnce('uploadTask');

			const task = uploadData({
				path: testPath,
				data: smallData,
			});

			expect(task).toBe('uploadTask');
			expect(mockCreateUploadTask).toHaveBeenCalledWith(
				expect.objectContaining({
					job: 'putObjectJob',
					onCancel: expect.any(Function),
					isMultipartUpload: false,
				}),
			);
		});
	});

	describe('use multipartUpload for large uploads', () => {
		const biggerData = { size: 5 * 1024 * 1024 + 1 } as any;
		it('should use multipartUpload if data size is > 5MB', async () => {
			const testInput = {
				path: testPath,
				data: biggerData,
			};

			uploadData(testInput);

			expect(mockPutObjectJob).not.toHaveBeenCalled();
			expect(mockGetMultipartUploadHandlers).toHaveBeenCalledWith(
				testInput,
				expect.any(Number),
			);
		});

		it('should use uploadTask', async () => {
			mockCreateUploadTask.mockReturnValueOnce('uploadTask');
			const task = uploadData({
				path: testPath,
				data: biggerData,
			});
			expect(task).toBe('uploadTask');
			expect(mockCreateUploadTask).toHaveBeenCalledWith(
				expect.objectContaining({
					job: expect.any(Function),
					onCancel: expect.any(Function),
					onResume: expect.any(Function),
					onPause: expect.any(Function),
					isMultipartUpload: true,
				}),
			);
		});
	});
});
