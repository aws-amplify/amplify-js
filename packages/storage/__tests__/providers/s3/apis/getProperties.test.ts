// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { headObject } from '../../../../src/providers/s3/utils/client';
import { getProperties } from '../../../../src/providers/s3';
import { Credentials } from '@aws-sdk/types';
import { Amplify } from '@aws-amplify/core';
import { StorageOptions } from '../../../../src/types';

jest.mock('../../../../src/providers/s3/utils/client');
jest.mock('@aws-amplify/core', () => ({
	Amplify: {
		getConfig: jest.fn(),
		Auth: {
			fetchAuthSession: jest.fn(),
		},
	},
}));
const mockHeadObject = headObject as jest.Mock;
const mockFetchAuthSession = Amplify.Auth.fetchAuthSession as jest.Mock;
const mockGetConfig = Amplify.getConfig as jest.Mock;

const bucket = 'bucket';
const region = 'region';
const credentials: Credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const targetIdentityId = 'targetIdentityId';
const defaultIdentityId = 'defaultIdentityId';

describe('getProperties api', () => {
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
	describe('getProperties happy path ', () => {
		const expected = {
			key: 'key',
			size: '100',
			contentType: 'text/plain',
			eTag: 'etag',
			metadata: { key: 'value' },
			lastModified: 'last-modified',
			versionId: 'version-id',
		};
		const config = {
			credentials,
			region: 'region',
		};
		const key = 'key';
		beforeEach(() => {
			mockHeadObject.mockReturnValueOnce({
				ContentLength: '100',
				ContentType: 'text/plain',
				ETag: 'etag',
				LastModified: 'last-modified',
				Metadata: { key: 'value' },
				VersionId: 'version-id',
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
			{
				options: { accessLevel: 'protected', targetIdentityId },
				expectedKey: `protected/${targetIdentityId}/${key}`,
			},
		].forEach(({ options, expectedKey }) => {
			const accessLevelMsg = options?.accessLevel ?? 'default';
			const targetIdentityIdMsg = options?.targetIdentityId
				? `and targetIdentityId`
				: '';
			it(`should getProperties with ${accessLevelMsg} accessLevel ${targetIdentityIdMsg}`, async () => {
				const headObjectOptions = {
					Bucket: 'bucket',
					Key: expectedKey,
				};
				expect.assertions(3);
				expect(
					await getProperties({
						key,
						options: options as StorageOptions,
					})
				).toEqual(expected);
				expect(headObject).toBeCalledTimes(1);
				expect(headObject).toHaveBeenCalledWith(config, headObjectOptions);
			});
		});
	});

	describe('getProperties error path', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});
		it('getProperties should return a not found error', async () => {
			mockHeadObject.mockRejectedValueOnce(
				Object.assign(new Error(), {
					$metadata: { httpStatusCode: 404 },
					name: 'NotFound',
				})
			);
			try {
				await getProperties({ key: 'keyed' });
			} catch (error) {
				expect.assertions(3);
				expect(headObject).toBeCalledTimes(1);
				expect(headObject).toHaveBeenCalledWith(
					{
						credentials,
						region: 'region',
					},
					{
						Bucket: 'bucket',
						Key: 'public/keyed',
					}
				);
				expect(error.$metadata.httpStatusCode).toBe(404);
			}
		});
	});
});
