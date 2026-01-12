// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { deleteFolderContents } from '../../../../src/providers/s3/utils/deleteFolderContents';
import {
	deleteObjects,
	listObjectsV2,
} from '../../../../src/providers/s3/utils/client/s3data';
import { CancellationToken } from '../../../../src/providers/s3/utils/CancellationToken';
import { CanceledError } from '../../../../src/errors/CanceledError';
import { calculateContentMd5 } from '../../../../src/providers/s3/utils/md5';

jest.mock('../../../../src/providers/s3/utils/client/s3data');
jest.mock('../../../../src/providers/s3/utils/md5');

const mockDeleteObjects = deleteObjects as jest.Mock;
const mockListObjectsV2 = listObjectsV2 as jest.Mock;
const mockCalculateContentMd5 = calculateContentMd5 as jest.Mock;

describe('deleteFolderContents', () => {
	const mockS3Config = {
		credentials: { accessKeyId: 'key', secretAccessKey: 'secret' },
		region: 'us-east-1',
	};
	const mockBucket = 'test-bucket';
	const mockFolderKey = 'folder/';
	const mockExpectedBucketOwner = '123456789012';

	beforeEach(() => {
		jest.clearAllMocks();
		mockCalculateContentMd5.mockResolvedValue('mock-md5-hash');
	});

	describe('successful deletion', () => {
		it('should delete all objects in folder', async () => {
			const mockObjects = [
				{ Key: 'folder/file1.txt', Size: 100 },
				{ Key: 'folder/file2.txt', Size: 200 },
			];

			mockListObjectsV2.mockResolvedValue({
				Contents: mockObjects,
				IsTruncated: false,
			});

			mockDeleteObjects.mockResolvedValue({
				Deleted: [{ Key: 'folder/file1.txt' }, { Key: 'folder/file2.txt' }],
				Errors: [],
			});

			const result = await deleteFolderContents({
				s3Config: mockS3Config,
				bucket: mockBucket,
				folderKey: mockFolderKey,
			});

			expect(result.path).toBe(mockFolderKey);
			expect(mockListObjectsV2).toHaveBeenCalledWith(
				expect.objectContaining({
					userAgentValue: expect.any(String),
				}),
				expect.objectContaining({
					Bucket: mockBucket,
					Prefix: mockFolderKey,
					MaxKeys: 1000,
				}),
			);
		});

		it('should handle empty folder', async () => {
			mockListObjectsV2.mockResolvedValue({
				Contents: [],
				IsTruncated: false,
			});

			const result = await deleteFolderContents({
				s3Config: mockS3Config,
				bucket: mockBucket,
				folderKey: mockFolderKey,
			});

			expect(result.path).toBe(mockFolderKey);
			expect(mockDeleteObjects).not.toHaveBeenCalled();
		});

		it('should handle pagination', async () => {
			mockListObjectsV2
				.mockResolvedValueOnce({
					Contents: [{ Key: 'folder/file1.txt', Size: 100 }],
					IsTruncated: true,
					NextContinuationToken: 'token1',
				})
				.mockResolvedValueOnce({
					Contents: [{ Key: 'folder/file2.txt', Size: 200 }],
					IsTruncated: false,
				});

			mockDeleteObjects
				.mockResolvedValueOnce({
					Deleted: [{ Key: 'folder/file1.txt' }],
					Errors: [],
				})
				.mockResolvedValueOnce({
					Deleted: [{ Key: 'folder/file2.txt' }],
					Errors: [],
				});

			const result = await deleteFolderContents({
				s3Config: mockS3Config,
				bucket: mockBucket,
				folderKey: mockFolderKey,
			});

			expect(result.path).toBe(mockFolderKey);
			expect(mockListObjectsV2).toHaveBeenCalledTimes(2);
			expect(mockDeleteObjects).toHaveBeenCalledTimes(2);
		});
	});

	describe('progress tracking', () => {
		it('should call onProgress callback', async () => {
			const mockOnProgress = jest.fn();
			const mockObjects = [
				{ Key: 'folder/file1.txt', Size: 100 },
				{ Key: 'folder/file2.txt', Size: 200 },
			];

			mockListObjectsV2.mockResolvedValue({
				Contents: mockObjects,
				IsTruncated: false,
			});

			mockDeleteObjects.mockResolvedValue({
				Deleted: [{ Key: 'folder/file1.txt' }, { Key: 'folder/file2.txt' }],
				Errors: [],
			});

			await deleteFolderContents({
				s3Config: mockS3Config,
				bucket: mockBucket,
				folderKey: mockFolderKey,
				onProgress: mockOnProgress,
			});

			expect(mockOnProgress).toHaveBeenCalledWith({
				deleted: [{ path: 'folder/file1.txt' }, { path: 'folder/file2.txt' }],
				failed: [],
			});
		});

		it('should report errors in progress callback', async () => {
			const mockOnProgress = jest.fn();
			const mockObjects = [{ Key: 'folder/file1.txt', Size: 100 }];

			mockListObjectsV2.mockResolvedValue({
				Contents: mockObjects,
				IsTruncated: false,
			});

			mockDeleteObjects.mockResolvedValue({
				Deleted: [],
				Errors: [
					{
						Key: 'folder/file1.txt',
						Code: 'AccessDenied',
						Message: 'Access denied',
					},
				],
			});

			await deleteFolderContents({
				s3Config: mockS3Config,
				bucket: mockBucket,
				folderKey: mockFolderKey,
				onProgress: mockOnProgress,
			});

			expect(mockOnProgress).toHaveBeenCalledWith({
				deleted: [],
				failed: [
					{
						path: 'folder/file1.txt',
						code: 'AccessDenied',
						message: 'Access denied',
					},
				],
			});
		});
	});

	describe('cancellation', () => {
		it('should throw CanceledError when cancelled', async () => {
			const cancellationToken = new CancellationToken();
			cancellationToken.cancel();

			await expect(
				deleteFolderContents({
					s3Config: mockS3Config,
					bucket: mockBucket,
					folderKey: mockFolderKey,
					cancellationToken,
				}),
			).rejects.toThrow(CanceledError);
		});

		it('should complete successfully when not cancelled', async () => {
			const cancellationToken = new CancellationToken();

			mockListObjectsV2.mockResolvedValue({
				Contents: [],
				IsTruncated: false,
			});

			const result = await deleteFolderContents({
				s3Config: mockS3Config,
				bucket: mockBucket,
				folderKey: mockFolderKey,
				cancellationToken,
			});

			expect(result.path).toBe(mockFolderKey);
		});
	});

	describe('options', () => {
		it('should include expectedBucketOwner in requests', async () => {
			const mockObjects = [{ Key: 'folder/file1.txt', Size: 100 }];

			mockListObjectsV2.mockResolvedValue({
				Contents: mockObjects,
				IsTruncated: false,
			});

			mockDeleteObjects.mockResolvedValue({
				Deleted: [{ Key: 'folder/file1.txt' }],
				Errors: [],
			});

			await deleteFolderContents({
				s3Config: mockS3Config,
				bucket: mockBucket,
				folderKey: mockFolderKey,
				expectedBucketOwner: mockExpectedBucketOwner,
			});

			expect(mockListObjectsV2).toHaveBeenCalledWith(
				expect.objectContaining({
					userAgentValue: expect.any(String),
				}),
				expect.objectContaining({
					ExpectedBucketOwner: mockExpectedBucketOwner,
				}),
			);

			expect(mockDeleteObjects).toHaveBeenCalledWith(
				expect.objectContaining({
					userAgentValue: expect.any(String),
				}),
				expect.objectContaining({
					ExpectedBucketOwner: mockExpectedBucketOwner,
				}),
			);
		});
	});
});
