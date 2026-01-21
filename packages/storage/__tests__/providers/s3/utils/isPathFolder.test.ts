// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isPathFolder } from '../../../../src/providers/s3/utils/isPathFolder';
import { listObjectsV2 } from '../../../../src/providers/s3/utils/client/s3data';

jest.mock('../../../../src/providers/s3/utils/client/s3data');

const mockListObjectsV2 = listObjectsV2 as jest.Mock;

describe('isPathFolder', () => {
	const mockS3Config = {
		credentials: { accessKeyId: 'key', secretAccessKey: 'secret' },
		region: 'us-east-1',
	};
	const mockBucket = 'test-bucket';
	const mockExpectedBucketOwner = '123456789012';

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('path ending with slash', () => {
		it('should return true for path ending with slash when objects exist', async () => {
			mockListObjectsV2.mockResolvedValue({
				Contents: [{ Key: 'folder/file.txt' }],
				CommonPrefixes: [],
			});

			const result = await isPathFolder({
				s3Config: mockS3Config,
				bucket: mockBucket,
				key: 'folder/',
			});

			expect(result).toBe(true);
		});

		it('should return false for path ending with slash when no objects exist', async () => {
			mockListObjectsV2.mockResolvedValue({
				Contents: [],
				CommonPrefixes: [],
			});

			const result = await isPathFolder({
				s3Config: mockS3Config,
				bucket: mockBucket,
				key: 'folder/',
			});

			expect(result).toBe(false);
		});
	});

	describe('path not ending with slash', () => {
		it('should return true when objects exist with prefix', async () => {
			mockListObjectsV2.mockResolvedValue({
				Contents: [{ Key: 'folder/file.txt' }],
				CommonPrefixes: [],
			});

			const result = await isPathFolder({
				s3Config: mockS3Config,
				bucket: mockBucket,
				key: 'folder',
			});

			expect(result).toBe(true);
		});

		it('should return false when no objects exist', async () => {
			mockListObjectsV2.mockResolvedValue({
				Contents: [],
				CommonPrefixes: [],
			});

			const result = await isPathFolder({
				s3Config: mockS3Config,
				bucket: mockBucket,
				key: 'file.txt',
			});

			expect(result).toBe(false);
		});

		it('should return false when listObjectsV2 throws error', async () => {
			const error = new Error('Access denied');
			mockListObjectsV2.mockRejectedValue(error);

			const result = await isPathFolder({
				s3Config: mockS3Config,
				bucket: mockBucket,
				key: 'file.txt',
			});

			expect(result).toBe(false);
		});

		it('should include expectedBucketOwner when provided', async () => {
			mockListObjectsV2.mockResolvedValue({
				Contents: [],
				CommonPrefixes: [],
			});

			await isPathFolder({
				s3Config: mockS3Config,
				bucket: mockBucket,
				key: 'folder',
				expectedBucketOwner: mockExpectedBucketOwner,
			});

			expect(mockListObjectsV2).toHaveBeenCalledWith(
				expect.objectContaining({
					userAgentValue: expect.any(String),
				}),
				{
					Bucket: mockBucket,
					Prefix: 'folder/',
					MaxKeys: 1,
					ExpectedBucketOwner: mockExpectedBucketOwner,
				},
			);
		});
	});
});
