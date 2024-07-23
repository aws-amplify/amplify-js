// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';
import { Amplify } from '@aws-amplify/core';

import {
	headObject,
	putObject,
} from '../../../../../src/providers/s3/utils/client/s3data';
import { calculateContentMd5 } from '../../../../../src/providers/s3/utils';
import { putObjectJob } from '../../../../../src/providers/s3/apis/uploadData/putObjectJob';
import '../testUtils';

jest.mock('../../../../../src/providers/s3/utils/client/s3data');
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
const mockHeadObject = jest.mocked(headObject);

mockFetchAuthSession.mockResolvedValue({
	credentials,
	identityId,
});
jest.mocked(Amplify.getConfig).mockReturnValue({
	Storage: {
		S3: {
			bucket: 'bucket',
			region: 'region',
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
				region: 'region',
				abortSignal: abortController.signal,
				onUploadProgress: expect.any(Function),
				useAccelerateEndpoint: true,
				userAgentValue: expect.any(String),
			},
			{
				Bucket: 'bucket',
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
					region: 'region',
					abortSignal: abortController.signal,
					onUploadProgress: expect.any(Function),
					useAccelerateEndpoint: true,
					userAgentValue: expect.any(String),
				},
				{
					Bucket: 'bucket',
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

	describe('overwrite prevention', () => {
		beforeEach(() => {
			mockHeadObject.mockClear();
		});

		it('should upload if target key is not found', async () => {
			expect.assertions(3);
			const notFoundError = new Error('mock message');
			notFoundError.name = 'NotFound';
			mockHeadObject.mockRejectedValueOnce(notFoundError);

			const job = putObjectJob(
				{
					path: testPath,
					data: 'data',
					options: { preventOverwrite: true },
				},
				new AbortController().signal,
			);
			await job();

			await expect(mockHeadObject).toBeLastCalledWithConfigAndInput(
				{
					credentials,
					region: 'region',
				},
				{
					Bucket: 'bucket',
					Key: testPath,
				},
			);
			expect(mockHeadObject).toHaveBeenCalledTimes(1);
			expect(mockPutObject).toHaveBeenCalledTimes(1);
		});

		it('should not upload if target key already exists', async () => {
			expect.assertions(3);
			mockHeadObject.mockResolvedValueOnce({
				ContentLength: 0,
				$metadata: {},
			});
			const job = putObjectJob(
				{
					path: testPath,
					data: 'data',
					options: { preventOverwrite: true },
				},
				new AbortController().signal,
			);
			await expect(job()).rejects.toThrow(
				'At least one of the pre-conditions you specified did not hold',
			);
			expect(mockHeadObject).toHaveBeenCalledTimes(1);
			expect(mockPutObject).not.toHaveBeenCalled();
		});

		it('should not upload if HeadObject fails with other error', async () => {
			expect.assertions(3);
			const accessDeniedError = new Error('mock error');
			accessDeniedError.name = 'AccessDenied';
			mockHeadObject.mockRejectedValueOnce(accessDeniedError);
			const job = putObjectJob(
				{
					path: testPath,
					data: 'data',
					options: { preventOverwrite: true },
				},
				new AbortController().signal,
			);
			await expect(job()).rejects.toThrow('mock error');
			expect(mockHeadObject).toHaveBeenCalledTimes(1);
			expect(mockPutObject).not.toHaveBeenCalled();
		});
	});
});
