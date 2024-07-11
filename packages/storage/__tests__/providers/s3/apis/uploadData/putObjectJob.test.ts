// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';
import { Amplify } from '@aws-amplify/core';

import { putObject } from '../../../../../src/providers/s3/utils/client';
import { calculateContentMd5 } from '../../../../../src/providers/s3/utils';
import { putObjectJob } from '../../../../../src/providers/s3/apis/uploadData/putObjectJob';
import '../testUtils';

jest.mock('../../../../../src/providers/s3/utils/client');
jest.mock('../../../../../src/providers/s3/utils', () => {
	const utils = jest.requireActual('../../../../../src/providers/s3/utils');

	return {
		...utils,
		calculateContentMd5: jest.fn(),
	};
});
jest.mock('@aws-amplify/core', () => ({
	ConsoleLogger: jest.fn(),
	fetchAuthSession: jest.fn(),
	Amplify: {
		getConfig: jest.fn(),
		Auth: {
			fetchAuthSession: jest.fn(),
		},
	},
}));

const testPath = 'testPath/object';
const credentials: AWSCredentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const identityId = 'identityId';
const mockFetchAuthSession = jest.mocked(Amplify.Auth.fetchAuthSession);
const mockPutObject = jest.mocked(putObject);
const bucket = 'bucket';
const region = 'region';

mockFetchAuthSession.mockResolvedValue({
	credentials,
	identityId,
});
jest.mocked(Amplify.getConfig).mockReturnValue({
	Storage: {
		S3: {
			bucket,
			region,
			buckets: { 'default-bucket': { bucketName: bucket, region } },
		},
	},
});
mockPutObject.mockResolvedValue({
	ETag: 'eTag',
	VersionId: 'versionId',
	$metadata: {},
});

/* TODO Remove suite when `key` parameter is removed */
describe('putObjectJob with key', () => {
	beforeEach(() => {
		mockPutObject.mockClear();
	});

	it('should supply the correct parameters to putObject API handler', async () => {
		const abortController = new AbortController();
		const inputKey = 'key';
		const data = 'data';
		const mockContentType = 'contentType';
		const contentDisposition = 'contentDisposition';
		const contentEncoding = 'contentEncoding';
		const mockMetadata = { key: 'value' };
		const onProgress = jest.fn();
		const useAccelerateEndpoint = true;

		const job = putObjectJob(
			{
				key: inputKey,
				data,
				options: {
					contentDisposition,
					contentEncoding,
					contentType: mockContentType,
					metadata: mockMetadata,
					onProgress,
					useAccelerateEndpoint,
				},
			},
			abortController.signal,
		);
		const result = await job();
		expect(result).toEqual({
			key: inputKey,
			eTag: 'eTag',
			versionId: 'versionId',
			contentType: 'contentType',
			metadata: { key: 'value' },
			size: undefined,
		});
		expect(mockPutObject).toHaveBeenCalledTimes(1);
		await expect(mockPutObject).toBeLastCalledWithConfigAndInput(
			{
				credentials,
				region,
				abortSignal: abortController.signal,
				onUploadProgress: expect.any(Function),
				useAccelerateEndpoint: true,
				userAgentValue: expect.any(String),
			},
			{
				Bucket: bucket,
				Key: `public/${inputKey}`,
				Body: data,
				ContentType: mockContentType,
				ContentDisposition: contentDisposition,
				ContentEncoding: contentEncoding,
				Metadata: mockMetadata,
				ContentMD5: undefined,
			},
		);
	});

	it('should set ContentMD5 if object lock is enabled', async () => {
		Amplify.libraryOptions = {
			Storage: {
				S3: {
					isObjectLockEnabled: true,
				},
			},
		};
		const job = putObjectJob(
			{
				key: 'key',
				data: 'data',
			},
			new AbortController().signal,
		);
		await job();
		expect(calculateContentMd5).toHaveBeenCalledWith('data');
	});

	describe('bucket passed in options', () => {
		it('should override bucket in putObject call when bucket as object', async () => {
			const abortController = new AbortController();
			const data = 'data';
			const bucketName = 'bucket-1';
			const mockRegion = 'region-1';

			const job = putObjectJob(
				{
					key: 'key',
					data,
					options: {
						bucket: {
							bucketName,
							region: mockRegion,
						},
					},
				},
				new AbortController().signal,
			);
			await job();

			await expect(mockPutObject).toBeLastCalledWithConfigAndInput(
				{
					credentials,
					region: mockRegion,
					abortSignal: abortController.signal,
					userAgentValue: expect.any(String),
				},
				{
					Bucket: bucketName,
					Key: 'public/key',
					Body: data,
					ContentType: 'application/octet-stream',
				},
			);
		});

		it('should override bucket in putObject call when bucket as string', async () => {
			const abortController = new AbortController();
			const data = 'data';
			const job = putObjectJob(
				{
					key: 'key',
					data,
					options: {
						bucket: 'default-bucket',
					},
				},
				new AbortController().signal,
			);
			await job();

			await expect(mockPutObject).toBeLastCalledWithConfigAndInput(
				{
					credentials,
					region,
					abortSignal: abortController.signal,
					userAgentValue: expect.any(String),
				},
				{
					Bucket: bucket,
					Key: 'public/key',
					Body: data,
					ContentType: 'application/octet-stream',
				},
			);
		});
	});
});

describe('putObjectJob with path', () => {
	beforeEach(() => {
		mockPutObject.mockClear();
	});

	test.each([
		{
			path: testPath,
			expectedKey: testPath,
		},
		{
			path: () => testPath,
			expectedKey: testPath,
		},
	])(
		'should supply the correct parameters to putObject API handler when path is $path',
		async ({ path: inputPath, expectedKey }) => {
			const abortController = new AbortController();
			const data = 'data';
			const mockContentType = 'contentType';
			const contentDisposition = 'contentDisposition';
			const contentEncoding = 'contentEncoding';
			const mockMetadata = { key: 'value' };
			const onProgress = jest.fn();
			const useAccelerateEndpoint = true;

			const job = putObjectJob(
				{
					path: inputPath,
					data,
					options: {
						contentDisposition,
						contentEncoding,
						contentType: mockContentType,
						metadata: mockMetadata,
						onProgress,
						useAccelerateEndpoint,
					},
				},
				abortController.signal,
			);
			const result = await job();
			expect(result).toEqual({
				path: expectedKey,
				eTag: 'eTag',
				versionId: 'versionId',
				contentType: 'contentType',
				metadata: { key: 'value' },
				size: undefined,
			});
			expect(mockPutObject).toHaveBeenCalledTimes(1);
			await expect(mockPutObject).toBeLastCalledWithConfigAndInput(
				{
					credentials,
					region,
					abortSignal: abortController.signal,
					onUploadProgress: expect.any(Function),
					useAccelerateEndpoint: true,
					userAgentValue: expect.any(String),
				},
				{
					Bucket: bucket,
					Key: expectedKey,
					Body: data,
					ContentType: mockContentType,
					ContentDisposition: contentDisposition,
					ContentEncoding: contentEncoding,
					Metadata: mockMetadata,
					ContentMD5: undefined,
				},
			);
		},
	);

	it('should set ContentMD5 if object lock is enabled', async () => {
		Amplify.libraryOptions = {
			Storage: {
				S3: {
					isObjectLockEnabled: true,
				},
			},
		};
		const job = putObjectJob(
			{
				path: testPath,
				data: 'data',
			},
			new AbortController().signal,
		);
		await job();
		expect(calculateContentMd5).toHaveBeenCalledWith('data');
	});

	describe('bucket passed in options', () => {
		it('should override bucket in putObject call when bucket as object', async () => {
			const abortController = new AbortController();
			const data = 'data';
			const bucketName = 'bucket-1';
			const mockRegion = 'region-1';

			const job = putObjectJob(
				{
					path: 'path/',
					data,
					options: {
						bucket: {
							bucketName,
							region: mockRegion,
						},
					},
				},
				new AbortController().signal,
			);
			await job();

			await expect(mockPutObject).toBeLastCalledWithConfigAndInput(
				{
					credentials,
					region: mockRegion,
					abortSignal: abortController.signal,
					userAgentValue: expect.any(String),
				},
				{
					Bucket: bucketName,
					Key: 'path/',
					Body: data,
					ContentType: 'application/octet-stream',
				},
			);
		});

		it('should override bucket in putObject call when bucket as string', async () => {
			const abortController = new AbortController();
			const data = 'data';
			const job = putObjectJob(
				{
					path: 'path/',
					data,
					options: {
						bucket: 'default-bucket',
					},
				},
				new AbortController().signal,
			);
			await job();

			await expect(mockPutObject).toBeLastCalledWithConfigAndInput(
				{
					credentials,
					region,
					abortSignal: abortController.signal,
					userAgentValue: expect.any(String),
				},
				{
					Bucket: bucket,
					Key: 'path/',
					Body: data,
					ContentType: 'application/octet-stream',
				},
			);
		});
	});
});
