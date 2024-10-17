// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';
import { Amplify, StorageAccessLevel } from '@aws-amplify/core';

import { deleteObject } from '../../../../src/providers/s3/utils/client/s3data';
import { remove } from '../../../../src/providers/s3/apis';
import { StorageValidationErrorCode } from '../../../../src/errors/types/validation';
import {
	RemoveInput,
	RemoveOutput,
	RemoveWithPathInput,
	RemoveWithPathOutput,
} from '../../../../src/providers/s3/types';
import './testUtils';

jest.mock('../../../../src/providers/s3/utils/client/s3data');
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
			const removeWrapper = (input: RemoveInput): Promise<RemoveOutput> =>
				remove(input);

			beforeEach(() => {
				mockDeleteObject.mockImplementation(() => {
					return {
						Metadata: { key: 'value' },
					};
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
					const { key } = await removeWrapper({
						key: inputKey,
						options,
					});
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
			const removeWrapper = (
				input: RemoveWithPathInput,
			): Promise<RemoveWithPathOutput> => remove(input);
			beforeEach(() => {
				mockDeleteObject.mockImplementation(() => {
					return {
						Metadata: { key: 'value' },
					};
				});
			});
			afterEach(() => {
				jest.clearAllMocks();
			});
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
					const { path } = await removeWrapper({ path: inputPath });
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

			describe('bucket passed in options', () => {
				it('should override bucket in deleteObject call when bucket is object', async () => {
					const mockBucketName = 'bucket-1';
					const mockRegion = 'region-1';
					await removeWrapper({
						path: 'path/',
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
						},
						{
							Bucket: mockBucketName,
							Key: 'path/',
						},
					);
				});
				it('should override bucket in deleteObject call when bucket is string', async () => {
					await removeWrapper({
						path: 'path/',
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
						},
						{
							Bucket: bucket,
							Key: 'path/',
						},
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
				await remove({ key });
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
				await remove({ path: '' });
			} catch (error: any) {
				expect(error.name).toBe(
					StorageValidationErrorCode.InvalidStorageOperationInput,
				);
			}
		});
	});
});
