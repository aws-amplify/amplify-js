// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';
import { Amplify, StorageAccessLevel } from '@aws-amplify/core';

import { StorageError } from '../../../../src/errors/StorageError';
import { StorageValidationErrorCode } from '../../../../src/errors/types/validation';
import { copyObject } from '../../../../src/providers/s3/utils/client/s3data';
import { copy } from '../../../../src/providers/s3/apis';
import {
	CopyInput,
	CopyOutput,
	CopyWithPathInput,
	CopyWithPathOutput,
} from '../../../../src/providers/s3/types';
import './testUtils';
import { BucketInfo } from '../../../../src/providers/s3/types/options';

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
const mockCopyObject = copyObject as jest.Mock;
const mockFetchAuthSession = Amplify.Auth.fetchAuthSession as jest.Mock;
const mockGetConfig = Amplify.getConfig as jest.Mock;

const sourceKey = 'sourceKey';
const destinationKey = 'destinationKey';
const bucket = 'bucket';
const region = 'region';
const targetIdentityId = 'targetIdentityId';
const defaultIdentityId = 'defaultIdentityId';
const validBucketOwner = '111122223333';
const validBucketOwner2 = '123456789012';
const credentials: AWSCredentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const copyObjectClientConfig = {
	credentials,
	region,
	userAgentValue: expect.any(String),
};
const copyObjectClientBaseParams = {
	Bucket: bucket,
	MetadataDirective: 'COPY',
};

describe('copy API', () => {
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
					buckets: { 'bucket-1': { bucketName: bucket, region } },
				},
			},
		});
	});

	describe('Happy Cases', () => {
		describe('With key', () => {
			const copyWrapper = async (input: CopyInput): Promise<CopyOutput> =>
				copy(input);
			beforeEach(() => {
				mockCopyObject.mockImplementation(() => {
					return {
						Metadata: { key: 'value' },
					};
				});
			});
			afterEach(() => {
				jest.clearAllMocks();
			});
			const testCases: {
				source: { accessLevel?: StorageAccessLevel; targetIdentityId?: string };
				destination: {
					accessLevel?: StorageAccessLevel;
				};
				expectedSourceKey: string;
				expectedDestinationKey: string;
			}[] = [
				{
					source: { accessLevel: 'guest' },
					destination: { accessLevel: 'guest' },
					expectedSourceKey: `${bucket}/public/${sourceKey}`,
					expectedDestinationKey: `public/${destinationKey}`,
				},
				{
					source: { accessLevel: 'guest' },
					destination: { accessLevel: 'private' },
					expectedSourceKey: `${bucket}/public/${sourceKey}`,
					expectedDestinationKey: `private/${defaultIdentityId}/${destinationKey}`,
				},
				{
					source: { accessLevel: 'guest' },
					destination: { accessLevel: 'protected' },
					expectedSourceKey: `${bucket}/public/${sourceKey}`,
					expectedDestinationKey: `protected/${defaultIdentityId}/${destinationKey}`,
				},
				{
					source: { accessLevel: 'private' },
					destination: { accessLevel: 'guest' },
					expectedSourceKey: `${bucket}/private/${defaultIdentityId}/${sourceKey}`,
					expectedDestinationKey: `public/${destinationKey}`,
				},
				{
					source: { accessLevel: 'private' },
					destination: { accessLevel: 'private' },
					expectedSourceKey: `${bucket}/private/${defaultIdentityId}/${sourceKey}`,
					expectedDestinationKey: `private/${defaultIdentityId}/${destinationKey}`,
				},
				{
					source: { accessLevel: 'private' },
					destination: { accessLevel: 'protected' },
					expectedSourceKey: `${bucket}/private/${defaultIdentityId}/${sourceKey}`,
					expectedDestinationKey: `protected/${defaultIdentityId}/${destinationKey}`,
				},
				{
					source: { accessLevel: 'protected' },
					destination: { accessLevel: 'guest' },
					expectedSourceKey: `${bucket}/protected/${defaultIdentityId}/${sourceKey}`,
					expectedDestinationKey: `public/${destinationKey}`,
				},
				{
					source: { accessLevel: 'protected' },
					destination: { accessLevel: 'private' },
					expectedSourceKey: `${bucket}/protected/${defaultIdentityId}/${sourceKey}`,
					expectedDestinationKey: `private/${defaultIdentityId}/${destinationKey}`,
				},
				{
					source: { accessLevel: 'protected' },
					destination: { accessLevel: 'protected' },
					expectedSourceKey: `${bucket}/protected/${defaultIdentityId}/${sourceKey}`,
					expectedDestinationKey: `protected/${defaultIdentityId}/${destinationKey}`,
				},
				{
					source: { accessLevel: 'protected', targetIdentityId },
					destination: { accessLevel: 'guest' },
					expectedSourceKey: `${bucket}/protected/${targetIdentityId}/${sourceKey}`,
					expectedDestinationKey: `public/${destinationKey}`,
				},
				{
					source: { accessLevel: 'protected', targetIdentityId },
					destination: { accessLevel: 'private' },
					expectedSourceKey: `${bucket}/protected/${targetIdentityId}/${sourceKey}`,
					expectedDestinationKey: `private/${defaultIdentityId}/${destinationKey}`,
				},
				{
					source: { accessLevel: 'protected', targetIdentityId },
					destination: { accessLevel: 'protected' },
					expectedSourceKey: `${bucket}/protected/${targetIdentityId}/${sourceKey}`,
					expectedDestinationKey: `protected/${defaultIdentityId}/${destinationKey}`,
				},
			];
			testCases.forEach(
				({
					source,
					destination,
					expectedSourceKey,
					expectedDestinationKey,
				}) => {
					const targetIdentityIdMsg = source?.targetIdentityId
						? `with targetIdentityId`
						: '';
					it(`should copy ${source.accessLevel} ${targetIdentityIdMsg} -> ${destination.accessLevel}`, async () => {
						const { key } = await copyWrapper({
							source: {
								...source,
								key: sourceKey,
							},
							destination: {
								...destination,
								key: destinationKey,
							},
						});
						expect(key).toEqual(destinationKey);
						expect(copyObject).toHaveBeenCalledTimes(1);
						await expect(copyObject).toBeLastCalledWithConfigAndInput(
							copyObjectClientConfig,
							{
								...copyObjectClientBaseParams,
								CopySource: expectedSourceKey,
								Key: expectedDestinationKey,
							},
						);
					});
				},
			);

			it('should override bucket in copyObject call when bucket option is passed', async () => {
				const bucketInfo: BucketInfo = {
					bucketName: 'bucket-2',
					region: 'region-2',
				};
				await copyWrapper({
					source: { key: 'sourceKey', bucket: 'bucket-1' },
					destination: {
						key: 'destinationKey',
						bucket: bucketInfo,
					},
				});
				expect(copyObject).toHaveBeenCalledTimes(1);
				await expect(copyObject).toBeLastCalledWithConfigAndInput(
					{
						credentials,
						region: bucketInfo.region,
						userAgentValue: expect.any(String),
					},
					{
						Bucket: bucketInfo.bucketName,
						MetadataDirective: 'COPY',
						CopySource: `${bucket}/public/sourceKey`,
						Key: 'public/destinationKey',
					},
				);
			});

			it('should pass notModifiedSince to copyObject', async () => {
				const mockDate = 'mock-date' as any;
				await copyWrapper({
					source: {
						key: 'sourceKey',
						notModifiedSince: mockDate,
					},
					destination: { key: 'destinationKey' },
				});
				expect(copyObject).toHaveBeenCalledTimes(1);
				expect(copyObject).toHaveBeenCalledWith(
					expect.anything(),
					expect.objectContaining({
						CopySourceIfUnmodifiedSince: mockDate,
					}),
				);
			});

			it('should pass eTag to copyObject', async () => {
				const mockEtag = 'mock-etag';
				await copyWrapper({
					source: {
						key: 'sourceKey',
						eTag: mockEtag,
					},
					destination: { key: 'destinationKey' },
				});
				expect(copyObject).toHaveBeenCalledTimes(1);
				expect(copyObject).toHaveBeenCalledWith(
					expect.anything(),
					expect.objectContaining({
						CopySourceIfMatch: mockEtag,
					}),
				);
			});

			describe('ExpectedBucketOwner passed in options', () => {
				it('should include expectedBucketOwner in headers when provided', async () => {
					const mockEtag = 'mock-etag';
					await copyWrapper({
						source: {
							key: 'sourceKey',
							eTag: mockEtag,
							expectedBucketOwner: validBucketOwner,
						},
						destination: {
							key: 'destinationKey',
							expectedBucketOwner: validBucketOwner2,
						},
					});
					expect(copyObject).toHaveBeenCalledTimes(1);
					expect(copyObject).toHaveBeenCalledWith(
						expect.anything(),
						expect.objectContaining({
							ExpectedSourceBucketOwner: validBucketOwner,
							ExpectedBucketOwner: validBucketOwner2,
						}),
					);
				});
			});
		});

		describe('With path', () => {
			const copyWrapper = async (
				input: CopyWithPathInput,
			): Promise<CopyWithPathOutput> => copy(input);

			beforeEach(() => {
				mockCopyObject.mockImplementation(() => {
					return {
						Metadata: { key: 'value' },
					};
				});
			});
			afterEach(() => {
				jest.clearAllMocks();
			});

			test.each([
				{
					sourcePath: 'sourcePathAsString',
					expectedSourcePath: 'sourcePathAsString',
					destinationPath: 'destinationPathAsString',
					expectedDestinationPath: 'destinationPathAsString',
				},
				{
					sourcePath: () => 'sourcePathAsFunction',
					expectedSourcePath: 'sourcePathAsFunction',
					destinationPath: () => 'destinationPathAsFunction',
					expectedDestinationPath: 'destinationPathAsFunction',
				},
			])(
				'should copy $sourcePath -> $destinationPath',
				async ({
					sourcePath,
					expectedSourcePath,
					destinationPath,
					expectedDestinationPath,
				}) => {
					const { path } = await copyWrapper({
						source: { path: sourcePath },
						destination: { path: destinationPath },
					});
					expect(path).toEqual(expectedDestinationPath);
					expect(copyObject).toHaveBeenCalledTimes(1);
					await expect(copyObject).toBeLastCalledWithConfigAndInput(
						copyObjectClientConfig,
						{
							...copyObjectClientBaseParams,
							CopySource: `${bucket}/${expectedSourcePath}`,
							Key: expectedDestinationPath,
						},
					);
				},
			);
			it('should override bucket in copyObject call when bucket option is passed', async () => {
				const bucketInfo: BucketInfo = {
					bucketName: 'bucket-2',
					region: 'region-2',
				};
				await copyWrapper({
					source: { path: 'sourcePath', bucket: 'bucket-1' },
					destination: {
						path: 'destinationPath',
						bucket: bucketInfo,
					},
				});
				expect(copyObject).toHaveBeenCalledTimes(1);
				await expect(copyObject).toBeLastCalledWithConfigAndInput(
					{
						credentials,
						region: bucketInfo.region,
						userAgentValue: expect.any(String),
					},
					{
						Bucket: bucketInfo.bucketName,
						MetadataDirective: 'COPY',
						CopySource: `${bucket}/sourcePath`,
						Key: 'destinationPath',
					},
				);
			});

			it('should pass notModifiedSince to copyObject', async () => {
				const mockDate = 'mock-date' as any;
				await copyWrapper({
					source: {
						path: 'sourcePath',
						notModifiedSince: mockDate,
					},
					destination: { path: 'destinationPath' },
				});
				expect(copyObject).toHaveBeenCalledTimes(1);
				expect(copyObject).toHaveBeenCalledWith(
					expect.anything(),
					expect.objectContaining({
						CopySourceIfUnmodifiedSince: mockDate,
					}),
				);
			});

			it('should pass eTag to copyObject', async () => {
				const mockEtag = 'mock-etag';
				await copyWrapper({
					source: {
						path: 'sourcePath',
						eTag: mockEtag,
					},
					destination: { path: 'destinationPath' },
				});
				expect(copyObject).toHaveBeenCalledTimes(1);
				expect(copyObject).toHaveBeenCalledWith(
					expect.anything(),
					expect.objectContaining({
						CopySourceIfMatch: mockEtag,
					}),
				);
			});
			describe('ExpectedBucketOwner passed in options', () => {
				it('should include expectedBucketOwner in headers when provided', async () => {
					const mockEtag = 'mock-etag';
					await copyWrapper({
						source: {
							path: 'public/sourceKey',
							eTag: mockEtag,
							expectedBucketOwner: validBucketOwner,
						},
						destination: {
							path: 'public/destinationKey',
							expectedBucketOwner: validBucketOwner2,
						},
					});
					expect(copyObject).toHaveBeenCalledTimes(1);
					expect(copyObject).toHaveBeenCalledWith(
						expect.anything(),
						expect.objectContaining({
							ExpectedSourceBucketOwner: validBucketOwner,
							ExpectedBucketOwner: validBucketOwner2,
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
			mockCopyObject.mockRejectedValueOnce(
				Object.assign(new Error(), {
					$metadata: { httpStatusCode: 404 },
					name: 'NotFound',
				}),
			);
			expect.assertions(3);
			const missingSourceKey = 'SourceKeyNotFound';
			try {
				await copy({
					source: { key: missingSourceKey },
					destination: { key: destinationKey },
				});
			} catch (error: any) {
				expect(copyObject).toHaveBeenCalledTimes(1);
				await expect(copyObject).toBeLastCalledWithConfigAndInput(
					copyObjectClientConfig,
					{
						...copyObjectClientBaseParams,
						CopySource: `${bucket}/public/${missingSourceKey}`,
						Key: `public/${destinationKey}`,
					},
				);
				expect(error.$metadata.httpStatusCode).toBe(404);
			}
		});

		it('should return a path not found error when source uses path and destination uses key', async () => {
			expect.assertions(2);
			try {
				// @ts-expect-error mismatch copy input not allowed
				await copy({
					source: { path: 'sourcePath' },
					destination: { key: 'destinationKey' },
				});
			} catch (error: any) {
				expect(error).toBeInstanceOf(StorageError);
				// source uses path so destination expects path as well
				expect(error.name).toBe(StorageValidationErrorCode.NoDestinationPath);
			}
		});

		it('should return a key not found error when source uses key and destination uses path', async () => {
			expect.assertions(2);
			try {
				// @ts-expect-error mismatch copy input not allowed
				await copy({
					source: { key: 'sourcePath' },
					destination: { path: 'destinationKey' },
				});
			} catch (error: any) {
				expect(error).toBeInstanceOf(StorageError);
				expect(error.name).toBe(StorageValidationErrorCode.NoDestinationKey);
			}
		});

		it('should throw an error when only source has bucket option', async () => {
			expect.assertions(2);
			try {
				await copy({
					source: { path: 'source', bucket: 'bucket-1' },
					destination: {
						path: 'destination',
					},
				});
			} catch (error: any) {
				expect(error).toBeInstanceOf(StorageError);
				expect(error.name).toBe(
					StorageValidationErrorCode.InvalidCopyOperationStorageBucket,
				);
			}
		});

		it('should throw an error when only one destination has bucket option', async () => {
			expect.assertions(2);
			try {
				await copy({
					source: { key: 'source' },
					destination: {
						key: 'destination',
						bucket: 'bucket-1',
					},
				});
			} catch (error: any) {
				expect(error).toBeInstanceOf(StorageError);
				expect(error.name).toBe(
					StorageValidationErrorCode.InvalidCopyOperationStorageBucket,
				);
			}
		});
	});
});
