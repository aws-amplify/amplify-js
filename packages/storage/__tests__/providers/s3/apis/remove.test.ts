// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';
import { Amplify } from '@aws-amplify/core';
import { deleteObject } from '../../../../src/providers/s3/utils/client';
import { remove } from '../../../../src/providers/s3/apis';
import { StorageOptions } from '../../../../src/types';
import { StorageValidationErrorCode } from '../../../../src/errors/types/validation';

jest.mock('../../../../src/providers/s3/utils/client');
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
const mockGetConfig = Amplify.getConfig as jest.Mock;
const key = 'key';
const bucket = 'bucket';
const region = 'region';
const defaultIdentityId = 'defaultIdentityId';
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
				},
			},
		});
	});
	describe('Happy Cases', () => {
		describe('With Key', () => {
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
					expectedKey: `public/${key}`,
				},
				{
					options: { accessLevel: 'guest' },
					expectedKey: `public/${key}`,
				},
				{
					options: { accessLevel: 'private' },
					expectedKey: `private/${defaultIdentityId}/${key}`,
				},
				{
					options: { accessLevel: 'protected' },
					expectedKey: `protected/${defaultIdentityId}/${key}`,
				},
			].forEach(({ options, expectedKey }) => {
				const accessLevel = options?.accessLevel ?? 'default';
				const removeResultKey = { key };

				it(`should remove object with ${accessLevel} accessLevel`, async () => {
					expect.assertions(3);
					expect(
						await remove({ key, options: options as StorageOptions }),
					).toEqual({ ...removeResultKey, path: expectedKey });
					expect(deleteObject).toHaveBeenCalledTimes(1);
					expect(deleteObject).toHaveBeenCalledWith(deleteObjectClientConfig, {
						Bucket: bucket,
						Key: expectedKey,
					});
				});
			});
		});
		describe('With Path', () => {
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
					path: `public/${key}`,
				},
				{
					path: ({ identityId }: any) => `protected/${identityId}/${key}`,
				},
			].forEach(({ path }) => {
				const resolvePath =
					typeof path === 'string'
						? path
						: path({ identityId: defaultIdentityId });
				const removeResultPath = {
					path: resolvePath,
					key: resolvePath,
				};

				it(`should remove object for the given path`, async () => {
					expect.assertions(3);
					expect(await remove({ path })).toEqual(removeResultPath);
					expect(deleteObject).toHaveBeenCalledTimes(1);
					expect(deleteObject).toHaveBeenCalledWith(deleteObjectClientConfig, {
						Bucket: bucket,
						Key: resolvePath,
					});
				});
			});
		});
	});

	describe('Error Cases', () => {
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
				expect(deleteObject).toHaveBeenCalledWith(deleteObjectClientConfig, {
					Bucket: bucket,
					Key: `public/${key}`,
				});
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
