// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';
import { Amplify } from '@aws-amplify/core';
import { copyObject } from '../../../../src/providers/s3/utils/client';
import { copy } from '../../../../src/providers/s3/apis';
import {
	CopySourceOptions,
	CopyDestinationOptions,
} from '../../../../src/providers/s3/types';

jest.mock('../../../../src/providers/s3/utils/client');
jest.mock('@aws-amplify/core', () => ({
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
const copyResult = { key: destinationKey };
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
	describe('Happy Path Cases:', () => {
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
		[
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
		].forEach(
			({ source, destination, expectedSourceKey, expectedDestinationKey }) => {
				const targetIdentityIdMsg = source?.targetIdentityId
					? `with targetIdentityId`
					: '';
				it(`should copy ${source.accessLevel} ${targetIdentityIdMsg} -> ${destination.accessLevel}`, async () => {
					expect.assertions(3);
					expect(
						await copy({
							source: {
								...(source as CopySourceOptions),
								key: sourceKey,
							},
							destination: {
								...(destination as CopyDestinationOptions),
								key: destinationKey,
							},
						})
					).toEqual(copyResult);
					expect(copyObject).toBeCalledTimes(1);
					expect(copyObject).toHaveBeenCalledWith(copyObjectClientConfig, {
						...copyObjectClientBaseParams,
						CopySource: expectedSourceKey,
						Key: expectedDestinationKey,
					});
				});
			}
		);
	});

	describe('Error Path Cases:', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});
		it('should return a not found error', async () => {
			mockCopyObject.mockRejectedValueOnce(
				Object.assign(new Error(), {
					$metadata: { httpStatusCode: 404 },
					name: 'NotFound',
				})
			);
			expect.assertions(3);
			const sourceKey = 'SourceKeyNotFound';
			const destinationKey = 'destinationKey';
			try {
				await copy({
					source: { key: sourceKey },
					destination: { key: destinationKey },
				});
			} catch (error) {
				expect(copyObject).toBeCalledTimes(1);
				expect(copyObject).toHaveBeenCalledWith(copyObjectClientConfig, {
					...copyObjectClientBaseParams,
					CopySource: `${bucket}/public/${sourceKey}`,
					Key: `public/${destinationKey}`,
				});
				expect(error.$metadata.httpStatusCode).toBe(404);
			}
		});
	});
});
