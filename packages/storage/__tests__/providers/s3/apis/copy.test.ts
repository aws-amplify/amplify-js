// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';
import { Amplify, StorageAccessLevel } from '@aws-amplify/core';
import { StorageError } from '../../../../src/errors/StorageError';
import { StorageValidationErrorCode } from '../../../../src/errors/types/validation';
import { copyObject } from '../../../../src/providers/s3/utils/client';
import { copy } from '../../../../src/providers/s3/apis';
import {
	CopyInput,
	CopyWithPathInput,
	CopyOutput,
	CopyWithPathOutput,
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
const mockCopyObject = copyObject as jest.Mock;
const mockFetchAuthSession = Amplify.Auth.fetchAuthSession as jest.Mock;
const mockGetConfig = Amplify.getConfig as jest.Mock;

const sourceKey = 'sourceKey';
const destinationKey = 'destinationKey';
const bucket = 'bucket';
const region = 'region';
const targetIdentityId = 'targetIdentityId';
const defaultIdentityId = 'defaultIdentityId';
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
			const testCases: Array<{
				source: { accessLevel?: StorageAccessLevel; targetIdentityId?: string };
				destination: {
					accessLevel?: StorageAccessLevel;
				};
				expectedSourceKey: string;
				expectedDestinationKey: string;
			}> = [
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
						expect(copyObject).toHaveBeenCalledWith(copyObjectClientConfig, {
							...copyObjectClientBaseParams,
							CopySource: expectedSourceKey,
							Key: expectedDestinationKey,
						});
					});
				},
			);
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
					expect(copyObject).toHaveBeenCalledWith(copyObjectClientConfig, {
						...copyObjectClientBaseParams,
						CopySource: `${bucket}/${expectedSourcePath}`,
						Key: expectedDestinationPath,
					});
				},
			);
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
			const sourceKey = 'SourceKeyNotFound';
			const destinationKey = 'destinationKey';
			try {
				await copy({
					source: { key: sourceKey },
					destination: { key: destinationKey },
				});
			} catch (error: any) {
				expect(copyObject).toHaveBeenCalledTimes(1);
				expect(copyObject).toHaveBeenCalledWith(copyObjectClientConfig, {
					...copyObjectClientBaseParams,
					CopySource: `${bucket}/public/${sourceKey}`,
					Key: `public/${destinationKey}`,
				});
				expect(error.$metadata.httpStatusCode).toBe(404);
			}
		});

		it('should return a path not found error when source uses path and destination uses key', async () => {
			expect.assertions(2);
			try {
				// @ts-expect-error
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
				// @ts-expect-error
				await copy({
					source: { key: 'sourcePath' },
					destination: { path: 'destinationKey' },
				});
			} catch (error: any) {
				expect(error).toBeInstanceOf(StorageError);
				expect(error.name).toBe(StorageValidationErrorCode.NoDestinationKey);
			}
		});
	});
});
