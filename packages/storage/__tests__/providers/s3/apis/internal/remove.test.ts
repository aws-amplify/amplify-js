// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';
import { Amplify, StorageAccessLevel } from '@aws-amplify/core';

import {
	deleteObject,
	deleteObjects,
	headObject,
	listObjectsV2,
} from '../../../../../src/providers/s3/utils/client/s3data';
import { remove } from '../../../../../src/providers/s3/apis/internal/remove';
import { StorageValidationErrorCode } from '../../../../../src/errors/types/validation';
import {
	RemoveInput,
	RemoveOutput,
	RemoveWithPathInput,
	RemoveWithPathOutput,
} from '../../../../../src/providers/s3/types';
import { CanceledError } from '../../../../../src/errors/CanceledError';
import './testUtils';

jest.mock('../../../../../src/providers/s3/utils/client/s3data');
jest.mock('@aws-amplify/core', () => ({
	ConsoleLogger: jest.fn().mockImplementation(function ConsoleLogger() {
		return { debug: jest.fn() };
	}),
	Amplify: {
		getConfig: jest.fn(),
		Auth: {
			fetchAuthSession: jest.fn(),
		},
	},
}));

const mockDeleteObject = deleteObject as jest.Mock;
const mockDeleteObjects = deleteObjects as jest.Mock;
const mockListObjectsV2 = listObjectsV2 as jest.Mock;
const mockHeadObject = headObject as jest.Mock;
const mockFetchAuthSession = Amplify.Auth.fetchAuthSession as jest.Mock;
const mockGetConfig = jest.mocked(Amplify.getConfig);

const inputKey = 'key';
const bucket = 'bucket';
const region = 'region';
const defaultIdentityId = 'defaultIdentityId';
const validBucketOwner = '111122223333';
const credentials: AWSCredentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const deleteObjectClientConfig = {
	credentials,
	region,
	userAgentValue: expect.any(String),
	abortSignal: expect.any(Object),
};

describe('remove API', () => {
	beforeAll(() => {
		mockFetchAuthSession.mockResolvedValue({
			credentials,
			identityId: defaultIdentityId,
		});
		mockGetConfig.mockReturnValue({
			Storage: {
				S3: {
					bucket,
					region,
					buckets: { 'default-bucket': { bucketName: bucket, region } },
				},
			},
		});
	});

	describe('Happy Cases', () => {
		describe('With Key', () => {
			const removeWrapper = (input: RemoveInput) => remove(Amplify, input);

			beforeEach(() => {
				mockDeleteObject.mockImplementation(() => {
					return {
						Metadata: { key: 'value' },
					};
				});
				mockListObjectsV2.mockResolvedValue({
					Contents: [],
					CommonPrefixes: [],
				});
				mockDeleteObjects.mockResolvedValue({
					Deleted: [],
					Errors: [],
				});
				mockHeadObject.mockRejectedValue({
					name: 'NotFound',
					$metadata: { httpStatusCode: 404 },
				});
			});

			afterEach(() => {
				jest.clearAllMocks();
			});

			const testCases: {
				expectedKey: string;
				options?: { accessLevel?: StorageAccessLevel };
			}[] = [
				{
					expectedKey: `public/${inputKey}`,
				},
				{
					options: { accessLevel: 'guest' },
					expectedKey: `public/${inputKey}`,
				},
				{
					options: { accessLevel: 'private' },
					expectedKey: `private/${defaultIdentityId}/${inputKey}`,
				},
				{
					options: { accessLevel: 'protected' },
					expectedKey: `protected/${defaultIdentityId}/${inputKey}`,
				},
			];

			testCases.forEach(({ options, expectedKey }) => {
				const accessLevel = options?.accessLevel ?? 'default';

				it(`should remove object with ${accessLevel} accessLevel`, async () => {
					const { key } = (await removeWrapper({
						key: inputKey,
						options,
					})) as RemoveOutput;
					expect(key).toEqual(inputKey);
					expect(deleteObject).toHaveBeenCalledTimes(1);
					await expect(deleteObject).toBeLastCalledWithConfigAndInput(
						deleteObjectClientConfig,
						{
							Bucket: bucket,
							Key: expectedKey,
						},
					);
				});
			});

			describe('bucket passed in options', () => {
				it('should override bucket in deleteObject call when bucket is object', async () => {
					const mockBucketName = 'bucket-1';
					const mockRegion = 'region-1';
					await removeWrapper({
						key: inputKey,
						options: {
							bucket: { bucketName: mockBucketName, region: mockRegion },
						},
					});
					expect(deleteObject).toHaveBeenCalledTimes(1);
					await expect(deleteObject).toBeLastCalledWithConfigAndInput(
						{
							credentials,
							region: mockRegion,
							userAgentValue: expect.any(String),
							abortSignal: expect.any(Object),
						},
						{
							Bucket: mockBucketName,
							Key: `public/${inputKey}`,
						},
					);
				});

				it('should override bucket in deleteObject call when bucket is string', async () => {
					await removeWrapper({
						key: inputKey,
						options: {
							bucket: 'default-bucket',
						},
					});
					expect(deleteObject).toHaveBeenCalledTimes(1);
					await expect(deleteObject).toBeLastCalledWithConfigAndInput(
						{
							credentials,
							region,
							userAgentValue: expect.any(String),
							abortSignal: expect.any(Object),
						},
						{
							Bucket: bucket,
							Key: `public/${inputKey}`,
						},
					);
				});
			});

			describe('ExpectedBucketOwner passed in options', () => {
				it('should include expectedBucketOwner in headers when provided', async () => {
					const mockKey = 'test-path';
					const mockBucket = 'bucket-1';
					const mockRegion = 'region-1';
					await removeWrapper({
						key: mockKey,
						options: {
							bucket: { bucketName: mockBucket, region: mockRegion },
							expectedBucketOwner: validBucketOwner,
						},
					});
					expect(deleteObject).toHaveBeenCalledTimes(1);
					expect(deleteObject).toHaveBeenNthCalledWithConfigAndInput(
						1,
						expect.any(Object),
						expect.objectContaining({
							ExpectedBucketOwner: validBucketOwner,
						}),
					);
				});
			});
		});

		describe('With Path', () => {
			const removeWrapper = (input: RemoveWithPathInput) =>
				remove(Amplify, input);

			beforeEach(() => {
				mockDeleteObject.mockImplementation(() => {
					return {
						Metadata: { key: 'value' },
					};
				});
				mockListObjectsV2.mockResolvedValue({
					Contents: [],
					CommonPrefixes: [],
				});
				mockDeleteObjects.mockResolvedValue({
					Deleted: [],
					Errors: [],
				});
				mockHeadObject.mockRejectedValue({
					name: 'NotFound',
					$metadata: { httpStatusCode: 404 },
				});
			});

			afterEach(() => {
				jest.clearAllMocks();
			});

			describe('single file deletion', () => {
				[
					{
						path: `public/${inputKey}`,
					},
					{
						path: ({ identityId }: { identityId?: string }) =>
							`protected/${identityId}/${inputKey}`,
					},
				].forEach(({ path: inputPath }) => {
					const resolvedPath =
						typeof inputPath === 'string'
							? inputPath
							: inputPath({ identityId: defaultIdentityId });

					it(`should remove object for the given path`, async () => {
						const { path } = (await removeWrapper({
							path: inputPath,
						})) as RemoveWithPathOutput;
						expect(path).toEqual(resolvedPath);
						expect(deleteObject).toHaveBeenCalledTimes(1);
						await expect(deleteObject).toBeLastCalledWithConfigAndInput(
							deleteObjectClientConfig,
							{
								Bucket: bucket,
								Key: resolvedPath,
							},
						);
					});
				});
			});

			describe('folder deletion', () => {
				it('should delete folder contents when path ends with slash', async () => {
					const folderPath = 'public/folder/';
					const mockObjects = [
						{ Key: 'public/folder/file1.txt', Size: 100 },
						{ Key: 'public/folder/file2.txt', Size: 200 },
					];

					mockListObjectsV2.mockResolvedValue({
						Contents: mockObjects,
						IsTruncated: false,
					});

					mockDeleteObjects.mockResolvedValue({
						Deleted: [
							{ Key: 'public/folder/file1.txt' },
							{ Key: 'public/folder/file2.txt' },
						],
						Errors: [],
					});

					const { path } = (await removeWrapper({
						path: folderPath,
					})) as RemoveWithPathOutput;

					expect(path).toEqual(folderPath);
					expect(mockListObjectsV2).toHaveBeenCalledWith(
						expect.objectContaining({
							credentials: expect.any(Function),
							userAgentValue: expect.any(String),
						}),
						{
							Bucket: bucket,
							Prefix: folderPath,
							MaxKeys: 1000,
							ContinuationToken: undefined,
							ExpectedBucketOwner: undefined,
						},
					);
					expect(mockDeleteObjects).toHaveBeenCalledWith(
						expect.objectContaining({
							credentials: expect.any(Function),
							userAgentValue: expect.any(String),
						}),
						{
							Bucket: bucket,
							Delete: {
								Objects: [
									{ Key: 'public/folder/file1.txt' },
									{ Key: 'public/folder/file2.txt' },
								],
								Quiet: false,
							},
							ExpectedBucketOwner: undefined,
						},
					);
				});

				it('should delete folder contents when headObject indicates folder', async () => {
					const folderPath = 'public/folder';
					const mockObjects = [{ Key: 'public/folder/file1.txt', Size: 100 }];

					mockHeadObject.mockRejectedValue({
						name: 'NotFound',
						$metadata: { httpStatusCode: 404 },
					});

					mockListObjectsV2.mockResolvedValue({
						Contents: mockObjects,
						IsTruncated: false,
					});

					mockDeleteObjects.mockResolvedValue({
						Deleted: [{ Key: 'public/folder/file1.txt' }],
						Errors: [],
					});

					const { path } = (await removeWrapper({
						path: folderPath,
					})) as RemoveWithPathOutput;

					expect(path).toEqual(folderPath);
					expect(mockListObjectsV2).toHaveBeenCalled();
					expect(mockDeleteObjects).toHaveBeenCalled();
				});

				it('should handle empty folder', async () => {
					const folderPath = 'public/empty-folder/';

					mockListObjectsV2.mockResolvedValue({
						Contents: [],
						IsTruncated: false,
					});

					const { path } = (await removeWrapper({
						path: folderPath,
					})) as RemoveWithPathOutput;

					expect(path).toEqual(folderPath);
					expect(mockDeleteObjects).not.toHaveBeenCalled();
				});

				it('should handle folder deletion with progress callback', async () => {
					const folderPath = 'public/folder/';
					const mockOnProgress = jest.fn();
					const mockObjects = [
						{ Key: 'public/folder/file1.txt', Size: 100 },
						{ Key: 'public/folder/file2.txt', Size: 200 },
					];

					mockListObjectsV2.mockResolvedValue({
						Contents: mockObjects,
						IsTruncated: false,
					});

					mockDeleteObjects.mockResolvedValue({
						Deleted: [
							{ Key: 'public/folder/file1.txt' },
							{ Key: 'public/folder/file2.txt' },
						],
						Errors: [],
					});

					await removeWrapper({
						path: folderPath,
						options: {
							onProgress: mockOnProgress,
						},
					});

					expect(mockOnProgress).toHaveBeenCalledWith({
						deleted: [
							{ path: 'public/folder/file1.txt' },
							{ path: 'public/folder/file2.txt' },
						],
						failed: [],
					});
				});
			});

			describe('cancellation', () => {
				it('should support cancellation during folder deletion', async () => {
					const folderPath = 'public/folder/';
					const operation = removeWrapper({
						path: folderPath,
					});

					operation.cancel();

					await expect(operation.result).rejects.toThrow(CanceledError);
					expect(operation.state).toBe('CANCELED');
				});

				it('should update operation state correctly', async () => {
					const operation = removeWrapper({
						path: 'public/file.txt',
					});

					expect(operation.state).toBe('IN_PROGRESS');

					await operation.result;

					expect(operation.state).toBe('SUCCESS');
				});
			});

			describe('bucket passed in options', () => {
				it('should override bucket in folder deletion when bucket is object', async () => {
					const mockBucketName = 'bucket-1';
					const mockRegion = 'region-1';
					const folderPath = 'path/';

					mockListObjectsV2.mockResolvedValue({
						Contents: [{ Key: 'path/file.txt', Size: 100 }],
						IsTruncated: false,
					});

					mockDeleteObjects.mockResolvedValue({
						Deleted: [{ Key: 'path/file.txt' }],
						Errors: [],
					});

					await removeWrapper({
						path: folderPath,
						options: {
							bucket: { bucketName: mockBucketName, region: mockRegion },
						},
					});

					expect(mockListObjectsV2).toHaveBeenCalledWith(
						expect.objectContaining({
							region: mockRegion,
						}),
						expect.objectContaining({
							Bucket: mockBucketName,
						}),
					);
				});

				it('should override bucket in folder deletion when bucket is string', async () => {
					const folderPath = 'path/';

					mockListObjectsV2.mockResolvedValue({
						Contents: [{ Key: 'path/file.txt', Size: 100 }],
						IsTruncated: false,
					});

					mockDeleteObjects.mockResolvedValue({
						Deleted: [{ Key: 'path/file.txt' }],
						Errors: [],
					});

					await removeWrapper({
						path: folderPath,
						options: {
							bucket: 'default-bucket',
						},
					});

					expect(mockListObjectsV2).toHaveBeenCalledWith(
						expect.objectContaining({
							region,
						}),
						expect.objectContaining({
							Bucket: bucket,
						}),
					);
				});
			});

			describe('ExpectedBucketOwner passed in options', () => {
				it('should include expectedBucketOwner in headers when provided', async () => {
					const mockPath = 'public/test-path';
					const mockBucket = 'bucket-1';
					const mockRegion = 'region-1';
					await removeWrapper({
						path: mockPath,
						options: {
							bucket: { bucketName: mockBucket, region: mockRegion },
							expectedBucketOwner: validBucketOwner,
						},
					});
					expect(deleteObject).toHaveBeenCalledTimes(1);
					expect(deleteObject).toHaveBeenNthCalledWithConfigAndInput(
						1,
						expect.any(Object),
						expect.objectContaining({
							ExpectedBucketOwner: validBucketOwner,
						}),
					);
				});
			});
		});
	});

	describe('Error Cases:', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		it('should return a not found error', async () => {
			mockDeleteObject.mockRejectedValueOnce(
				Object.assign(new Error(), {
					$metadata: { httpStatusCode: 404 },
					name: 'NotFound',
				}),
			);
			expect.assertions(3);
			const key = 'wrongKey';
			try {
				await remove(Amplify, { key });
			} catch (error: any) {
				expect(deleteObject).toHaveBeenCalledTimes(1);
				await expect(deleteObject).toBeLastCalledWithConfigAndInput(
					deleteObjectClientConfig,
					{
						Bucket: bucket,
						Key: `public/${key}`,
					},
				);
				expect(error.$metadata.httpStatusCode).toBe(404);
			}
		});

		it('should throw InvalidStorageOperationInput error when the path is empty', async () => {
			expect.assertions(1);
			try {
				await remove(Amplify, { path: '' });
			} catch (error: any) {
				expect(error.name).toBe(
					StorageValidationErrorCode.InvalidStorageOperationInput,
				);
			}
		});

		it('should throw InvalidStoragePathInput error when the path has leading slash', async () => {
			expect.assertions(1);
			try {
				await remove(Amplify, { path: '/invalid/path' });
			} catch (error: any) {
				expect(error.name).toBe('InvalidStoragePathInput');
			}
		});
	});
});
