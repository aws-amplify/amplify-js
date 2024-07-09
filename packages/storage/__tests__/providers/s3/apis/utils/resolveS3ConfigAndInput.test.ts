// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolveS3ConfigAndInput } from '../../../../../src/providers/s3/utils';
import { resolvePrefix } from '../../../../../src/utils/resolvePrefix';
import {
	StorageValidationErrorCode,
	validationErrorMap,
} from '../../../../../src/errors/types/validation';
import { S3Configuration } from '../../../../../src/providers/s3/apis/internal/types';
import { assertValidationError } from '../../../../../src/errors/utils/assertValidationError';

jest.mock('../../../../../src/utils/resolvePrefix');

const mockDefaultResolvePrefix = resolvePrefix as jest.Mock;

const bucket = 'bucket';
const region = 'region';
const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const targetIdentityId = 'targetIdentityId';

const mockCredentialsProvider = jest.fn();
const mockIdentityIdProvider = jest.fn();
const mockServiceOptions = { bucket, region };
const mockLibraryOptions = {};

describe('resolveS3ConfigAndInput', () => {
	const config: S3Configuration = {
		credentialsProvider: mockCredentialsProvider,
		identityIdProvider: mockIdentityIdProvider,
		serviceOptions: mockServiceOptions,
		libraryOptions: mockLibraryOptions,
	};
	beforeEach(() => {
		mockCredentialsProvider.mockImplementation(async () => credentials);
		mockIdentityIdProvider.mockImplementation(async () => targetIdentityId);
		jest.clearAllMocks();
	});

	it('should call fetchAuthSession for credentials and identityId', async () => {
		expect.assertions(1);
		await resolveS3ConfigAndInput({ ...config });
		expect(mockIdentityIdProvider).toHaveBeenCalled();
	});

	it('should throw if credentials are not available', async () => {
		expect.assertions(1);
		mockCredentialsProvider.mockImplementation(async () => {
			assertValidationError(
				!!undefined,
				StorageValidationErrorCode.NoCredentials,
			);
		});
		const {
			s3Config: { credentials: credentialsProvider },
		} = await resolveS3ConfigAndInput({ ...config });
		if (typeof credentialsProvider === 'function') {
			await expect(credentialsProvider()).rejects.toMatchObject(
				validationErrorMap[StorageValidationErrorCode.NoCredentials],
			);
		} else {
			fail('Expect credentials to be a function');
		}
	});

	it('should throw if identityId is not available', async () => {
		mockIdentityIdProvider.mockImplementation(async () => {
			assertValidationError(!!'', StorageValidationErrorCode.NoIdentityId);
		});
		await expect(resolveS3ConfigAndInput({ ...config })).rejects.toMatchObject(
			validationErrorMap[StorageValidationErrorCode.NoIdentityId],
		);
	});

	it('should resolve bucket from S3 config', async () => {
		const { bucket: resolvedBucket } = await resolveS3ConfigAndInput({
			...config,
		});
		expect(resolvedBucket).toEqual(bucket);
	});

	it('should throw if bucket is not available', async () => {
		await expect(
			resolveS3ConfigAndInput({
				...config,
				serviceOptions: {
					bucket: undefined,
				},
			}),
		).rejects.toMatchObject(
			validationErrorMap[StorageValidationErrorCode.NoBucket],
		);
	});

	it('should resolve region from S3 config', async () => {
		const { s3Config } = await resolveS3ConfigAndInput({ ...config });
		expect(s3Config.region).toEqual(region);
	});

	it('should throw if region is not available', async () => {
		await expect(
			resolveS3ConfigAndInput({
				...config,
				serviceOptions: {
					bucket,
				},
			}),
		).rejects.toMatchObject(
			validationErrorMap[StorageValidationErrorCode.NoRegion],
		);
	});

	it('should set customEndpoint and forcePathStyle to true if dangerouslyConnectToHttpEndpointForTesting is set from S3 config', async () => {
		const serviceOptions = {
			bucket,
			region,
			dangerouslyConnectToHttpEndpointForTesting: 'true',
		};

		const { s3Config } = await resolveS3ConfigAndInput({
			...config,
			serviceOptions,
		});
		expect(s3Config.customEndpoint).toEqual('http://localhost:20005');
		expect(s3Config.forcePathStyle).toEqual(true);
	});

	it('should resolve isObjectLockEnabled from S3 library options', async () => {
		const { isObjectLockEnabled } = await resolveS3ConfigAndInput({
			...config,
			libraryOptions: { isObjectLockEnabled: true },
		});
		expect(isObjectLockEnabled).toEqual(true);
	});

	it('should use default prefix resolver', async () => {
		mockDefaultResolvePrefix.mockResolvedValueOnce('prefix');
		const { keyPrefix } = await resolveS3ConfigAndInput({ ...config });
		expect(mockDefaultResolvePrefix).toHaveBeenCalled();
		expect(keyPrefix).toEqual('prefix');
	});

	it('should use prefix resolver from S3 library options if supplied', async () => {
		const customResolvePrefix = jest.fn().mockResolvedValueOnce('prefix');
		const { keyPrefix } = await resolveS3ConfigAndInput({
			...config,
			libraryOptions: {
				prefixResolver: customResolvePrefix,
			},
		});
		expect(customResolvePrefix).toHaveBeenCalled();
		expect(keyPrefix).toEqual('prefix');
		expect(mockDefaultResolvePrefix).not.toHaveBeenCalled();
	});

	it('should resolve prefix with given access level', async () => {
		mockDefaultResolvePrefix.mockResolvedValueOnce('prefix');
		const { keyPrefix } = await resolveS3ConfigAndInput({
			...config,
			apiOptions: {
				accessLevel: 'someLevel' as any,
			},
		});
		expect(mockDefaultResolvePrefix).toHaveBeenCalledWith({
			accessLevel: 'someLevel',
			targetIdentityId,
		});
		expect(keyPrefix).toEqual('prefix');
	});

	it('should resolve prefix with default access level from S3 library options', async () => {
		mockDefaultResolvePrefix.mockResolvedValueOnce('prefix');
		const { keyPrefix } = await resolveS3ConfigAndInput({
			...config,
			libraryOptions: {
				defaultAccessLevel: 'someLevel' as any,
			},
		});
		expect(mockDefaultResolvePrefix).toHaveBeenCalledWith({
			accessLevel: 'someLevel',
			targetIdentityId,
		});
		expect(keyPrefix).toEqual('prefix');
	});

	it('should resolve prefix with `guest` access level if no access level is given', async () => {
		mockDefaultResolvePrefix.mockResolvedValueOnce('prefix');
		const { keyPrefix } = await resolveS3ConfigAndInput({ ...config });
		expect(mockDefaultResolvePrefix).toHaveBeenCalledWith({
			accessLevel: 'guest', // default access level
			targetIdentityId,
		});
		expect(keyPrefix).toEqual('prefix');
	});
});
