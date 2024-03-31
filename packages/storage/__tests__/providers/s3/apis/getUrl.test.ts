// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getUrl } from '../../../../src/providers/s3/apis';
import { AWSCredentials } from '@aws-amplify/core/internals/utils';
import { Amplify, StorageAccessLevel } from '@aws-amplify/core';
import {
	getPresignedGetObjectUrl,
	headObject,
} from '../../../../src/providers/s3/utils/client';
import { GetUrlOptionsPath } from '../../../../src/providers/s3/types';

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

const bucket = 'bucket';
const region = 'region';
const mockFetchAuthSession = Amplify.Auth.fetchAuthSession as jest.Mock;
const mockGetConfig = Amplify.getConfig as jest.Mock;
const credentials: AWSCredentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const targetIdentityId = 'targetIdentityId';
const defaultIdentityId = 'defaultIdentityId';

describe('getUrl test with key', () => {
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
			region,
			userAgentValue: expect.any(String),
		};
		const key = 'key';
		beforeEach(() => {
			(headObject as jest.Mock).mockImplementation(() => {
				return {
					Key: 'key',
					ContentLength: '100',
					ContentType: 'text/plain',
					ETag: 'etag',
					LastModified: 'last-modified',
					Metadata: { key: 'value' },
				};
			});
			(getPresignedGetObjectUrl as jest.Mock).mockReturnValueOnce({
				url: new URL('https://google.com'),
			});
		});
		afterEach(() => {
			jest.clearAllMocks();
		});
		test.each([
			{
				expectedKey: `public/${key}`,
			},
			{
				options: { accessLevel: 'guest' as StorageAccessLevel },
				expectedKey: `public/${key}`,
			},
			{
				options: { accessLevel: 'private' as StorageAccessLevel },
				expectedKey: `private/${defaultIdentityId}/${key}`,
			},
			{
				options: { accessLevel: 'protected' as StorageAccessLevel },
				expectedKey: `protected/${defaultIdentityId}/${key}`,
			},
			{
				options: {
					accessLevel: 'protected' as StorageAccessLevel,
					targetIdentityId,
				},
				expectedKey: `protected/${targetIdentityId}/${key}`,
			},
		])(
			'should getUrl with key $expectedKey',
			async ({ options, expectedKey }) => {
				const headObjectOptions = {
					Bucket: bucket,
					Key: expectedKey,
				};
				const result = await getUrl({
					key,
					options: {
						...options,
						validateObjectExistence: true,
					},
				});
				expect(getPresignedGetObjectUrl).toHaveBeenCalledTimes(1);
				expect(headObject).toHaveBeenCalledTimes(1);
				expect(headObject).toHaveBeenCalledWith(config, headObjectOptions);
				expect(result.url).toEqual({
					url: new URL('https://google.com'),
				});
			},
		);
	});
	describe('Error cases :  With key', () => {
		afterAll(() => {
			jest.clearAllMocks();
		});
		it('should return not found error when the object is not found', async () => {
			(headObject as jest.Mock).mockImplementation(() => {
				throw Object.assign(new Error(), {
					$metadata: { httpStatusCode: 404 },
					name: 'NotFound',
				});
			});
			expect.assertions(2);
			try {
				await getUrl({
					key: 'invalid_key',
					options: { validateObjectExistence: true },
				});
			} catch (error: any) {
				expect(headObject).toHaveBeenCalledTimes(1);
				expect(error.$metadata?.httpStatusCode).toBe(404);
			}
		});
	});
});

describe('getUrl test with path', () => {
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

	describe('Happy cases: With path', () => {
		const config = {
			credentials,
			region,
			userAgentValue: expect.any(String),
		};
		beforeEach(() => {
			(headObject as jest.Mock).mockImplementation(() => {
				return {
					Key: 'path',
					ContentLength: '100',
					ContentType: 'text/plain',
					ETag: 'etag',
					LastModified: 'last-modified',
					Metadata: { key: 'value' },
				};
			});
			(getPresignedGetObjectUrl as jest.Mock).mockReturnValueOnce({
				url: new URL('https://google.com'),
			});
		});
		afterEach(() => {
			jest.clearAllMocks();
		});

		test.each([
			{
				path: 'path',
				expectedKey: 'path',
			},
			{
				path: () => 'path',
				expectedKey: 'path',
			},
		])(
			'should getUrl with path $path and expectedKey $expectedKey',
			async ({ path, expectedKey }) => {
				const headObjectOptions = {
					Bucket: bucket,
					Key: expectedKey,
				};
				const result = await getUrl({
					path,
					options: {
						validateObjectExistence: true,
					} as GetUrlOptionsPath,
				});
				expect(getPresignedGetObjectUrl).toHaveBeenCalledTimes(1);
				expect(headObject).toHaveBeenCalledTimes(1);
				expect(headObject).toHaveBeenCalledWith(config, headObjectOptions);
				expect(result.url).toEqual({
					url: new URL('https://google.com'),
				});
			},
		);
	});
	describe('Error cases :  With path', () => {
		afterAll(() => {
			jest.clearAllMocks();
		});
		it('should return not found error when the object is not found', async () => {
			(headObject as jest.Mock).mockImplementation(() => {
				throw Object.assign(new Error(), {
					$metadata: { httpStatusCode: 404 },
					name: 'NotFound',
				});
			});
			expect.assertions(2);
			try {
				await getUrl({
					path: 'invalid_key',
					options: { validateObjectExistence: true },
				});
			} catch (error: any) {
				expect(headObject).toHaveBeenCalledTimes(1);
				expect(error.$metadata?.httpStatusCode).toBe(404);
			}
		});
	});
});
