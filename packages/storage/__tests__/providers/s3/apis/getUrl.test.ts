// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getUrl } from '../../../../src/providers/s3/apis';
import { AWSCredentials } from '@aws-amplify/core/internals/utils';
import { Amplify, StorageAccessLevel } from '@aws-amplify/core';
import {
	getPresignedGetObjectUrl,
	headObject,
} from '../../../../src/providers/s3/utils/client';
import {
	GetUrlInput,
	GetUrlWithPathInput,
	GetUrlOutput,
	GetUrlWithPathOutput,
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
const mockURL = new URL('https://google.com');

describe('getUrl test with key', () => {
	const getUrlWrapper = (input: GetUrlInput): Promise<GetUrlOutput> =>
		getUrl(input);
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
			(headObject as jest.MockedFunction<typeof headObject>).mockResolvedValue({
				ContentLength: 100,
				ContentType: 'text/plain',
				ETag: 'etag',
				LastModified: new Date('01-01-1980'),
				Metadata: { meta: 'value' },
				$metadata: {} as any,
			});
			(
				getPresignedGetObjectUrl as jest.MockedFunction<
					typeof getPresignedGetObjectUrl
				>
			).mockResolvedValue(mockURL);
		});
		afterEach(() => {
			jest.clearAllMocks();
		});

		const testCases: Array<{
			options?: { accessLevel?: StorageAccessLevel; targetIdentityId?: string };
			expectedKey: string;
		}> = [
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
		];

		test.each(testCases)(
			'should getUrl with key $expectedKey',
			async ({ options, expectedKey }) => {
				const headObjectOptions = {
					Bucket: bucket,
					Key: expectedKey,
				};
				const { url, expiresAt } = await getUrlWrapper({
					key,
					options: {
						...options,
						validateObjectExistence: true,
					},
				});
				const expectedResult = {
					url: mockURL,
					expiresAt: expect.any(Date),
				};
				expect(getPresignedGetObjectUrl).toHaveBeenCalledTimes(1);
				expect(headObject).toHaveBeenCalledTimes(1);
				expect(headObject).toHaveBeenCalledWith(config, headObjectOptions);
				expect({ url, expiresAt }).toEqual(expectedResult);
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
				await getUrlWrapper({
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
	const getUrlWrapper = (
		input: GetUrlWithPathInput,
	): Promise<GetUrlWithPathOutput> => getUrl(input);
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
			(headObject as jest.MockedFunction<typeof headObject>).mockResolvedValue({
				ContentLength: 100,
				ContentType: 'text/plain',
				ETag: 'etag',
				LastModified: new Date('01-01-1980'),
				Metadata: { meta: 'value' },
				$metadata: {} as any,
			});
			(
				getPresignedGetObjectUrl as jest.MockedFunction<
					typeof getPresignedGetObjectUrl
				>
			).mockResolvedValue(mockURL);
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
				const { url, expiresAt } = await getUrlWrapper({
					path,
					options: {
						validateObjectExistence: true,
					},
				});
				expect(getPresignedGetObjectUrl).toHaveBeenCalledTimes(1);
				expect(headObject).toHaveBeenCalledTimes(1);
				expect(headObject).toHaveBeenCalledWith(config, headObjectOptions);
				expect({ url, expiresAt }).toEqual({
					url: mockURL,
					expiresAt: expect.any(Date),
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
				await getUrlWrapper({
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
