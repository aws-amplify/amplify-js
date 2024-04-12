// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';
import { Amplify } from '@aws-amplify/core';
import { deleteObject } from '../../../../src/providers/s3/utils/client';
import { remove } from '../../../../src/providers/s3/apis';
import { StorageOptions } from '../../../../src/types';
import { StorageValidationErrorCode } from '../../../../src/errors/types/validation';
import {
	RemoveInput,
	RemoveOptions,
	RemoveOutput,
} from '../../../../src/providers/s3/types';

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
const inputKey = 'key';
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

const removeWrapper = (input: RemoveInput): Promise<RemoveOutput> =>
	remove(input);

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
			].forEach(({ options, expectedKey }) => {
				const accessLevel = options?.accessLevel ?? 'default';

				it(`should remove object with ${accessLevel} accessLevel`, async () => {
					const removeResult = { key: inputKey, path: expectedKey };
					const { key, path } = await removeWrapper({
						key: inputKey,
						options: options as RemoveOptions,
					});
					expect({ key, path }).toEqual(removeResult);
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
					path: `public/${inputKey}`,
				},
				{
					path: ({ identityId }: any) => `protected/${identityId}/${inputKey}`,
				},
			].forEach(({ path: inputPath }) => {
				const resolvedPath =
					typeof inputPath === 'string'
						? inputPath
						: inputPath({ identityId: defaultIdentityId });
				const removeResultPath = {
					path: resolvedPath,
					key: resolvedPath,
				};

				it(`should remove object for the given path`, async () => {
					const { key, path } = await removeWrapper({ path: inputPath });
					expect({ key, path }).toEqual(removeResultPath);
					expect(deleteObject).toHaveBeenCalledTimes(1);
					expect(deleteObject).toHaveBeenCalledWith(deleteObjectClientConfig, {
						Bucket: bucket,
						Key: resolvedPath,
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
				await removeWrapper({ key });
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
				await removeWrapper({ path: '' });
			} catch (error: any) {
				expect(error.name).toBe(
					StorageValidationErrorCode.InvalidStorageOperationInput,
				);
			}
		});
	});
});
