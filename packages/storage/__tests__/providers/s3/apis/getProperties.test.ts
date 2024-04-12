// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { headObject } from '../../../../src/providers/s3/utils/client';
import { getProperties } from '../../../../src/providers/s3';
import { AWSCredentials } from '@aws-amplify/core/internals/utils';
import { Amplify } from '@aws-amplify/core';
import {
	GetPropertiesInput,
	GetPropertiesOptionsWithKey,
	GetPropertiesOutput,
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
const mockHeadObject = headObject as jest.Mock;
const mockFetchAuthSession = Amplify.Auth.fetchAuthSession as jest.Mock;
const mockGetConfig = Amplify.getConfig as jest.Mock;

const bucket = 'bucket';
const region = 'region';
const credentials: AWSCredentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const inputKey = 'key';
const path = 'path';
const targetIdentityId = 'targetIdentityId';
const defaultIdentityId = 'defaultIdentityId';

const expectedResult = {
	size: '100',
	contentType: 'text/plain',
	eTag: 'etag',
	metadata: { key: 'value' },
	lastModified: 'last-modified',
	versionId: 'version-id',
};

const getPropertiesWrapper = (
	input: GetPropertiesInput,
): Promise<GetPropertiesOutput> => getProperties(input);

describe('getProperties with key', () => {
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
	describe('Happy cases: With key', () => {
		const config = {
			credentials,
			region: 'region',
			userAgentValue: expect.any(String),
		};
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
		test.each([
			{
				generatedKey: `public/${inputKey}`,
			},
			{
				options: { accessLevel: 'guest' },
				generatedKey: `public/${inputKey}`,
			},
			{
				options: { accessLevel: 'private' },
				generatedKey: `private/${defaultIdentityId}/${inputKey}`,
			},
			{
				options: { accessLevel: 'protected' },
				generatedKey: `protected/${defaultIdentityId}/${inputKey}`,
			},
			{
				options: { accessLevel: 'protected', targetIdentityId },
				generatedKey: `protected/${targetIdentityId}/${inputKey}`,
			},
		])(
			'should getProperties with key $generatedKey',
			async ({ options, generatedKey }) => {
				const headObjectOptions = {
					Bucket: 'bucket',
					Key: generatedKey,
				};
				const { key, path, ...others } = await getProperties({
					key: inputKey,
					options: options as GetPropertiesOptionsWithKey,
				});
				expect({ key, path, ...others }).toEqual({
					key: inputKey,
					path: generatedKey,
					...expectedResult,
				});
				expect(headObject).toHaveBeenCalledTimes(1);
				expect(headObject).toHaveBeenCalledWith(config, headObjectOptions);
			},
		);
	});

	describe('Error cases :  With key', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});
		it('getProperties should return a not found error', async () => {
			mockHeadObject.mockRejectedValueOnce(
				Object.assign(new Error(), {
					$metadata: { httpStatusCode: 404 },
					name: 'NotFound',
				}),
			);
			expect.assertions(3);
			try {
				await getProperties({ key: inputKey });
			} catch (error: any) {
				expect(headObject).toHaveBeenCalledTimes(1);
				expect(headObject).toHaveBeenCalledWith(
					{
						credentials,
						region: 'region',
						userAgentValue: expect.any(String),
					},
					{
						Bucket: 'bucket',
						Key: `public/${inputKey}`,
					},
				);
				expect(error.$metadata.httpStatusCode).toBe(404);
			}
		});
	});
});

describe('Happy cases: With path', () => {
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
	describe('getProperties with path', () => {
		const config = {
			credentials,
			region: 'region',
			useAccelerateEndpoint: true,
			userAgentValue: expect.any(String),
		};
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
		test.each([
			{
				testPath: path,
				expectedPath: path,
			},
			{
				testPath: () => path,
				expectedPath: path,
			},
		])(
			'should getProperties with path $path and expectedPath $expectedPath',
			async ({ testPath, expectedPath }) => {
				const headObjectOptions = {
					Bucket: 'bucket',
					Key: expectedPath,
				};
				const { key, path, ...others } = await getProperties({
					path: testPath,
					options: {
						useAccelerateEndpoint: true,
					},
				});
				expect({ key, path, ...others }).toEqual({
					key: expectedPath,
					path: expectedPath,
					...expectedResult,
				});
				expect(headObject).toHaveBeenCalledTimes(1);
				expect(headObject).toHaveBeenCalledWith(config, headObjectOptions);
			},
		);
	});

	describe('Error cases :  With path', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});
		it('getProperties should return a not found error', async () => {
			mockHeadObject.mockRejectedValueOnce(
				Object.assign(new Error(), {
					$metadata: { httpStatusCode: 404 },
					name: 'NotFound',
				}),
			);
			expect.assertions(3);
			try {
				await getProperties({ path });
			} catch (error: any) {
				expect(headObject).toHaveBeenCalledTimes(1);
				expect(headObject).toHaveBeenCalledWith(
					{
						credentials,
						region: 'region',
						userAgentValue: expect.any(String),
					},
					{
						Bucket: 'bucket',
						Key: path,
					},
				);
				expect(error.$metadata.httpStatusCode).toBe(404);
			}
		});
	});
});
