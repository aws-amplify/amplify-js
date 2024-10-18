// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';
import { Amplify, StorageAccessLevel } from '@aws-amplify/core';

import { getUrl } from '../../../../src/providers/s3/apis';
import {
	getPresignedGetObjectUrl,
	headObject,
} from '../../../../src/providers/s3/utils/client/s3data';
import {
	GetUrlInput,
	GetUrlOutput,
	GetUrlWithPathInput,
	GetUrlWithPathOutput,
} from '../../../../src/providers/s3/types';
import './testUtils';
import { BucketInfo } from '../../../../src/providers/s3/types/options';

jest.mock('../../../../src/providers/s3/utils/client/s3data');
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
const mockFetchAuthSession = jest.mocked(Amplify.Auth.fetchAuthSession);
const mockGetConfig = jest.mocked(Amplify.getConfig);
const credentials: AWSCredentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const targetIdentityId = 'targetIdentityId';
const defaultIdentityId = 'defaultIdentityId';
const mockURL = new URL('https://google.com');
const validBucketOwner = '111122223333';
const invalidBucketOwner = '123';

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
					buckets: { 'default-bucket': { bucketName: bucket, region } },
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
			jest.mocked(headObject).mockResolvedValue({
				ContentLength: 100,
				ContentType: 'text/plain',
				ETag: 'etag',
				LastModified: new Date('01-01-1980'),
				Metadata: { meta: 'value' },
				$metadata: {} as any,
			});
			jest.mocked(getPresignedGetObjectUrl).mockResolvedValue(mockURL);
		});
		afterEach(() => {
			jest.clearAllMocks();
		});

		const testCases: {
			options?: { accessLevel?: StorageAccessLevel; targetIdentityId?: string };
			expectedKey: string;
		}[] = [
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
				await expect(headObject).toBeLastCalledWithConfigAndInput(
					config,
					headObjectOptions,
				);
				expect({ url, expiresAt }).toEqual(expectedResult);
			},
		);
		describe('bucket passed in options', () => {
			it('should override bucket in getPresignedGetObjectUrl call when bucket is object', async () => {
				const bucketInfo: BucketInfo = {
					bucketName: 'bucket-1',
					region: 'region-1',
				};
				await getUrlWrapper({
					key: 'key',
					options: {
						bucket: bucketInfo,
					},
				});
				expect(getPresignedGetObjectUrl).toHaveBeenCalledTimes(1);
				await expect(getPresignedGetObjectUrl).toBeLastCalledWithConfigAndInput(
					{
						credentials,
						region: bucketInfo.region,
						expiration: expect.any(Number),
					},
					{
						Bucket: bucketInfo.bucketName,
						Key: 'public/key',
					},
				);
			});
			it('should override bucket in getPresignedGetObjectUrl call when bucket is string', async () => {
				await getUrlWrapper({
					key: 'key',
					options: {
						bucket: 'default-bucket',
					},
				});
				expect(getPresignedGetObjectUrl).toHaveBeenCalledTimes(1);
				await expect(getPresignedGetObjectUrl).toBeLastCalledWithConfigAndInput(
					{
						credentials,
						region,
						expiration: expect.any(Number),
					},
					{
						Bucket: bucket,
						Key: 'public/key',
					},
				);
			});
		});
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
					buckets: { 'default-bucket': { bucketName: bucket, region } },
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
			jest.mocked(headObject).mockResolvedValue({
				ContentLength: 100,
				ContentType: 'text/plain',
				ETag: 'etag',
				LastModified: new Date('01-01-1980'),
				Metadata: { meta: 'value' },
				$metadata: {} as any,
			});
			jest.mocked(getPresignedGetObjectUrl).mockResolvedValue(mockURL);
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
				await expect(headObject).toBeLastCalledWithConfigAndInput(
					config,
					headObjectOptions,
				);
				expect({ url, expiresAt }).toEqual({
					url: mockURL,
					expiresAt: expect.any(Date),
				});
			},
		);

		describe('bucket passed in options', () => {
			it('should override bucket in getPresignedGetObjectUrl call when bucket is object', async () => {
				const inputPath = 'path/';
				const bucketInfo: BucketInfo = {
					bucketName: 'bucket-1',
					region: 'region-1',
				};
				await getUrlWrapper({
					path: inputPath,
					options: {
						bucket: bucketInfo,
					},
				});
				expect(getPresignedGetObjectUrl).toHaveBeenCalledTimes(1);
				await expect(getPresignedGetObjectUrl).toBeLastCalledWithConfigAndInput(
					{
						credentials,
						region: bucketInfo.region,
						expiration: expect.any(Number),
					},
					{
						Bucket: bucketInfo.bucketName,
						Key: inputPath,
					},
				);
			});
			it('should override bucket in getPresignedGetObjectUrl call when bucket is string', async () => {
				const inputPath = 'path/';
				await getUrlWrapper({
					path: inputPath,
					options: {
						bucket: 'default-bucket',
					},
				});
				expect(getPresignedGetObjectUrl).toHaveBeenCalledTimes(1);
				await expect(getPresignedGetObjectUrl).toBeLastCalledWithConfigAndInput(
					{
						credentials,
						region,
						expiration: expect.any(Number),
					},
					{
						Bucket: bucket,
						Key: inputPath,
					},
				);
			});
		});
	});
	describe('Happy cases: With path and Content Disposition, Content Type', () => {
		const config = {
			credentials,
			region,
			userAgentValue: expect.any(String),
		};
		beforeEach(() => {
			jest.mocked(headObject).mockResolvedValue({
				ContentLength: 100,
				ContentType: 'text/plain',
				ETag: 'etag',
				LastModified: new Date('01-01-1980'),
				Metadata: { meta: 'value' },
				$metadata: {} as any,
			});
			jest.mocked(getPresignedGetObjectUrl).mockResolvedValue(mockURL);
		});
		afterEach(() => {
			jest.clearAllMocks();
		});

		test.each([
			{
				path: 'path',
				expectedKey: 'path',
				contentDisposition: 'inline; filename="example.txt"',
				contentType: 'text/plain',
			},
			{
				path: () => 'path',
				expectedKey: 'path',
				contentDisposition: {
					type: 'attachment' as const,
					filename: 'example.pdf',
				},
				contentType: 'application/pdf',
			},
		])(
			'should getUrl with path $path and expectedKey $expectedKey and content disposition and content type',
			async ({ path, expectedKey, contentDisposition, contentType }) => {
				const headObjectOptions = {
					Bucket: bucket,
					Key: expectedKey,
				};
				const { url, expiresAt } = await getUrlWrapper({
					path,
					options: {
						validateObjectExistence: true,
						contentDisposition,
						contentType,
					},
				});
				expect(getPresignedGetObjectUrl).toHaveBeenCalledTimes(1);
				expect(headObject).toHaveBeenCalledTimes(1);
				await expect(headObject).toBeLastCalledWithConfigAndInput(
					config,
					headObjectOptions,
				);
				expect({ url, expiresAt }).toEqual({
					url: mockURL,
					expiresAt: expect.any(Date),
				});
			},
		);
	});
	describe('Error cases: With invalid Content Disposition', () => {
		const config = {
			credentials,
			region,
			userAgentValue: expect.any(String),
		};
		beforeEach(() => {
			jest.mocked(headObject).mockResolvedValue({
				ContentLength: 100,
				ContentType: 'text/plain',
				ETag: 'etag',
				LastModified: new Date('01-01-1980'),
				Metadata: { meta: 'value' },
				$metadata: {} as any,
			});
			jest.mocked(getPresignedGetObjectUrl).mockResolvedValue(mockURL);
		});

		afterEach(() => {
			jest.clearAllMocks();
		});

		test.each([
			{
				path: 'path',
				expectedKey: 'path',
				contentDisposition: {
					type: 'invalid' as 'attachment' | 'inline',
					filename: '"example.txt',
				},
			},
			{
				path: 'path',
				expectedKey: 'path',
				contentDisposition: {
					type: 'invalid' as 'attachment' | 'inline',
				},
			},
		])(
			'should ignore for invalid content disposition: $contentDisposition',
			async ({ path, expectedKey, contentDisposition }) => {
				const headObjectOptions = {
					Bucket: bucket,
					Key: expectedKey,
				};
				const { url, expiresAt } = await getUrlWrapper({
					path,
					options: {
						validateObjectExistence: true,
						contentDisposition,
					},
				});
				expect(getPresignedGetObjectUrl).toHaveBeenCalledTimes(1);
				expect(headObject).toHaveBeenCalledTimes(1);
				await expect(headObject).toBeLastCalledWithConfigAndInput(
					config,
					headObjectOptions,
				);
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

describe(`getURL with path and Expected Bucket Owner`, () => {
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
					buckets: { 'default-bucket': { bucketName: bucket, region } },
				},
			},
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should pass expectedBucketOwner to getPresignedGetObjectUrl', async () => {
		const path = 'public/expectedbucketowner_test';

		await getUrlWrapper({
			path,
			options: {
				expiresIn: 300,
				expectedBucketOwner: validBucketOwner,
			},
		});

		expect(getPresignedGetObjectUrl).toHaveBeenCalledTimes(1);
		await expect(getPresignedGetObjectUrl).toBeLastCalledWithConfigAndInput(
			{
				credentials,
				region,
				expiration: expect.any(Number),
			},
			{
				Bucket: bucket,
				ExpectedBucketOwner: validBucketOwner,
				Key: path,
			},
		);
	});

	it('getPresignedGetObjectUrl should not expose expectedBucketOwner when not provided', async () => {
		const path = 'public/expectedbucketowner_test';

		await getUrlWrapper({
			path,
			options: {
				expiresIn: 300,
			},
		});

		expect(getPresignedGetObjectUrl).toHaveBeenCalledTimes(1);
		await expect(getPresignedGetObjectUrl).toBeLastCalledWithConfigAndInput(
			{
				credentials,
				region,
				expiration: expect.any(Number),
			},
			{
				Bucket: bucket,
				Key: path,
			},
		);
	});

	it('should throw error on invalid bucket owner id', async () => {
		const path = 'public/expectedbucketowner_test';

		await expect(
			getUrlWrapper({
				path,
				options: {
					expectedBucketOwner: invalidBucketOwner,
				},
			}),
		).rejects.toThrow('Invalid AWS account ID was provided.');

		expect(getPresignedGetObjectUrl).not.toHaveBeenCalled();
	});
});
