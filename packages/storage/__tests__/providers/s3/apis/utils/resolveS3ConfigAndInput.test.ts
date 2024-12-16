// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { resolveS3ConfigAndInput } from '../../../../../src/providers/s3/utils';
import { resolvePrefix } from '../../../../../src/utils/resolvePrefix';
import {
	StorageValidationErrorCode,
	validationErrorMap,
} from '../../../../../src/errors/types/validation';
import {
	CallbackPathStorageInput,
	DeprecatedStorageInput,
} from '../../../../../src/providers/s3/utils/resolveS3ConfigAndInput';
import { INVALID_STORAGE_INPUT } from '../../../../../src/errors/constants';
import { BucketInfo } from '../../../../../src/providers/s3/types/options';
import { StorageError } from '../../../../../src/errors/StorageError';

jest.mock('@aws-amplify/core', () => ({
	ConsoleLogger: jest.fn(),
	Amplify: {
		getConfig: jest.fn(),
		Auth: {
			fetchAuthSession: jest.fn(),
		},
	},
}));
jest.mock('../../../../../src/utils/resolvePrefix');

const mockGetConfig = jest.mocked(Amplify.getConfig);
const mockDefaultResolvePrefix = resolvePrefix as jest.Mock;
const mockFetchAuthSession = Amplify.Auth.fetchAuthSession as jest.Mock;

const bucket = 'bucket';
const region = 'region';
const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const targetIdentityId = 'targetIdentityId';

describe('resolveS3ConfigAndInput', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		Amplify.libraryOptions = {};
	});
	mockFetchAuthSession.mockResolvedValue({
		credentials,
		identityId: targetIdentityId,
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

	it('should call fetchAuthSession for credentials and identityId', async () => {
		expect.assertions(1);
		await resolveS3ConfigAndInput(Amplify, {});
		expect(mockFetchAuthSession).toHaveBeenCalled();
	});

	it('should throw if credentials are not available', async () => {
		expect.assertions(1);
		mockFetchAuthSession.mockResolvedValue({
			identityId: targetIdentityId,
		});
		const {
			s3Config: { credentials: credentialsProvider },
		} = await resolveS3ConfigAndInput(Amplify, {});
		if (typeof credentialsProvider === 'function') {
			await expect(credentialsProvider()).rejects.toMatchObject(
				validationErrorMap[StorageValidationErrorCode.NoCredentials],
			);
		} else {
			fail('Expect credentials to be a function');
		}
	});

	it('should not throw if identityId is not available', async () => {
		mockFetchAuthSession.mockResolvedValueOnce({
			credentials,
		});
		expect(async () => resolveS3ConfigAndInput(Amplify, {})).not.toThrow();
	});

	it('should resolve bucket from S3 config', async () => {
		const { bucket: resolvedBucket } = await resolveS3ConfigAndInput(
			Amplify,
			{},
		);
		expect(resolvedBucket).toEqual(bucket);
		expect(mockGetConfig).toHaveBeenCalled();
	});

	it('should throw if bucket is not available', async () => {
		mockGetConfig.mockReturnValueOnce({
			Storage: {
				S3: {
					region,
				},
			},
		});
		await expect(resolveS3ConfigAndInput(Amplify, {})).rejects.toMatchObject(
			validationErrorMap[StorageValidationErrorCode.NoBucket],
		);
	});

	it('should resolve region from S3 config', async () => {
		const { s3Config } = await resolveS3ConfigAndInput(Amplify, {});
		expect(s3Config.region).toEqual(region);
		expect(mockGetConfig).toHaveBeenCalled();
	});

	it('should throw if region is not available', async () => {
		mockGetConfig.mockReturnValueOnce({
			Storage: {
				S3: {
					bucket,
				},
			},
		});
		await expect(resolveS3ConfigAndInput(Amplify, {})).rejects.toMatchObject(
			validationErrorMap[StorageValidationErrorCode.NoRegion],
		);
	});

	it('should set customEndpoint and forcePathStyle to true if dangerouslyConnectToHttpEndpointForTesting is set from S3 config', async () => {
		mockGetConfig.mockReturnValueOnce({
			Storage: {
				S3: {
					bucket,
					region,
					dangerouslyConnectToHttpEndpointForTesting: 'true',
				},
			},
		});
		const { s3Config } = await resolveS3ConfigAndInput(Amplify, {});
		expect(s3Config.customEndpoint).toEqual('http://localhost:20005');
		expect(s3Config.forcePathStyle).toEqual(true);
		expect(mockGetConfig).toHaveBeenCalled();
	});

	it('should resolve isObjectLockEnabled from S3 library options', async () => {
		Amplify.libraryOptions = {
			Storage: {
				S3: {
					isObjectLockEnabled: true,
				},
			},
		};
		const { isObjectLockEnabled } = await resolveS3ConfigAndInput(Amplify, {});
		expect(isObjectLockEnabled).toEqual(true);
	});

	it('should use default prefix resolver', async () => {
		mockDefaultResolvePrefix.mockResolvedValueOnce('prefix');
		const { keyPrefix } = await resolveS3ConfigAndInput(Amplify, {});
		expect(mockDefaultResolvePrefix).toHaveBeenCalled();
		expect(keyPrefix).toEqual('prefix');
	});

	it('should use prefix resolver from S3 library options if supplied', async () => {
		const customResolvePrefix = jest.fn().mockResolvedValueOnce('prefix');
		Amplify.libraryOptions = {
			Storage: {
				S3: {
					prefixResolver: customResolvePrefix,
				},
			},
		};
		const { keyPrefix } = await resolveS3ConfigAndInput(Amplify, {});
		expect(customResolvePrefix).toHaveBeenCalled();
		expect(keyPrefix).toEqual('prefix');
		expect(mockDefaultResolvePrefix).not.toHaveBeenCalled();
	});

	it('should resolve prefix with given access level', async () => {
		mockDefaultResolvePrefix.mockResolvedValueOnce('prefix');
		const { keyPrefix } = await resolveS3ConfigAndInput(Amplify, {
			options: { accessLevel: 'someLevel' as any },
		});
		expect(mockDefaultResolvePrefix).toHaveBeenCalledWith({
			accessLevel: 'someLevel',
			targetIdentityId,
		});
		expect(keyPrefix).toEqual('prefix');
	});

	it('should resolve prefix with default access level from S3 library options', async () => {
		mockDefaultResolvePrefix.mockResolvedValueOnce('prefix');
		Amplify.libraryOptions = {
			Storage: {
				S3: {
					defaultAccessLevel: 'someLevel' as any,
				},
			},
		};
		const { keyPrefix } = await resolveS3ConfigAndInput(Amplify, {});
		expect(mockDefaultResolvePrefix).toHaveBeenCalledWith({
			accessLevel: 'someLevel',
			targetIdentityId,
		});
		expect(keyPrefix).toEqual('prefix');
	});

	it('should resolve prefix with `guest` access level if no access level is given', async () => {
		mockDefaultResolvePrefix.mockResolvedValueOnce('prefix');
		const { keyPrefix } = await resolveS3ConfigAndInput(Amplify, {});
		expect(mockDefaultResolvePrefix).toHaveBeenCalledWith({
			accessLevel: 'guest', // default access level
			targetIdentityId,
		});
		expect(keyPrefix).toEqual('prefix');
	});

	describe('with locationCredentialsProvider', () => {
		const mockLocationCredentialsProvider = jest
			.fn()
			.mockReturnValue({ credentials });
		it('should resolve credentials without Amplify singleton', async () => {
			mockGetConfig.mockReturnValue({
				Storage: {
					S3: {
						bucket,
						region,
					},
				},
			});
			const { s3Config } = await resolveS3ConfigAndInput(Amplify, {
				options: {
					locationCredentialsProvider: mockLocationCredentialsProvider,
				},
			});

			if (typeof s3Config.credentials === 'function') {
				const result = await s3Config.credentials({ forceRefresh: true });
				expect(mockLocationCredentialsProvider).toHaveBeenCalledWith({
					forceRefresh: true,
				});
				expect(result).toEqual(credentials);
			} else {
				throw new Error('Expect credentials to be a function');
			}
		});

		it('should not throw when path is pass as a string', async () => {
			const { s3Config } = await resolveS3ConfigAndInput(Amplify, {
				path: 'my-path',
				options: {
					locationCredentialsProvider: mockLocationCredentialsProvider,
				},
			});

			if (typeof s3Config.credentials === 'function') {
				const result = await s3Config.credentials();
				expect(mockLocationCredentialsProvider).toHaveBeenCalled();
				expect(result).toEqual(credentials);
			} else {
				throw new Error('Expect credentials to be a function');
			}
		});

		describe('with deprecated or callback paths as inputs', () => {
			const key = 'mock-value';
			const prefix = 'mock-value';
			const path = () => 'path';
			const deprecatedInputs: DeprecatedStorageInput[] = [
				{ prefix },
				{ key },
				{
					source: { key },
					destination: { key },
				},
			];
			const callbackPathInputs: CallbackPathStorageInput[] = [
				{ path },
				{
					destination: { path },
					source: { path },
				},
			];

			const testCases = [...deprecatedInputs, ...callbackPathInputs];

			it.each(testCases)('should throw when input is %s', async input => {
				const { s3Config } = await resolveS3ConfigAndInput(Amplify, {
					...input,
					options: {
						locationCredentialsProvider: mockLocationCredentialsProvider,
					},
				});
				if (typeof s3Config.credentials === 'function') {
					await expect(s3Config.credentials()).rejects.toThrow(
						expect.objectContaining({
							name: INVALID_STORAGE_INPUT,
						}),
					);
				} else {
					throw new Error('Expect credentials to be a function');
				}
			});
		});
	});

	it('should resolve bucket and region with overrides when bucket API option is passed', async () => {
		const bucketInfo: BucketInfo = {
			bucketName: 'bucket-2',
			region: 'region-2',
		};

		const {
			bucket: resolvedBucket,
			s3Config: { region: resolvedRegion },
		} = await resolveS3ConfigAndInput(Amplify, {
			options: { bucket: bucketInfo },
		});

		expect(mockGetConfig).toHaveBeenCalled();
		expect(resolvedBucket).toEqual(bucketInfo.bucketName);
		expect(resolvedRegion).toEqual(bucketInfo.region);
	});

	it('should throw when unable to lookup bucket from the config when bucket API option is passed', async () => {
		try {
			await resolveS3ConfigAndInput(Amplify, {
				options: { bucket: 'error-bucket' },
			});
		} catch (error: any) {
			expect(error).toBeInstanceOf(StorageError);
			expect(error.name).toBe(StorageValidationErrorCode.InvalidStorageBucket);
		}
	});
});
