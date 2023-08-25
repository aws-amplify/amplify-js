// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Credentials } from '@aws-sdk/types';
import { AmplifyV6, fetchAuthSession } from '@aws-amplify/core';
import { putObject } from '../../../../src/AwsClients/S3';
import { calculateContentMd5 } from '../../../../src/providers/s3/utils';

import { putObjectJob } from '../../../../src/providers/s3/apis/uploadData/putObjectJob';

jest.mock('../../../../src/AwsClients/S3');
jest.mock('../../../../src/providers/s3/utils', () => {
	const utils = jest.requireActual('../../../../src/providers/s3/utils');
	return {
		...utils,
		calculateContentMd5: jest.fn(),
	};
});
jest.mock('@aws-amplify/core', () => {
	const core = jest.requireActual('@aws-amplify/core');
	return {
		...core,
		AmplifyV6: {
			...core.AmplifyV6,
			getConfig: jest.fn(),
		},
		fetchAuthSession: jest.fn(),
	};
});
const credentials: Credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const identityId = 'identityId';
const mockFetchAuthSession = fetchAuthSession as jest.Mock;
const mockPutObject = putObject as jest.Mock;

mockFetchAuthSession.mockResolvedValue({
	credentials,
	identityId,
});
(AmplifyV6.getConfig as jest.Mock).mockReturnValue({
	Storage: {
		bucket: 'bucket',
		region: 'region',
	},
});
mockPutObject.mockResolvedValue({
	ETag: 'eTag',
	VersionId: 'versionId',
});

// TODO[AllanZhengYP]: add more unit tests to cover different access level combination.
// TODO[AllanZhengYP]: add more unit tests to cover validations errors and service errors.
describe('putObjectJob', () => {
	it('should supply the correct parameters to putObject API handler', async () => {
		const abortController = new AbortController();
		const key = 'key';
		const data = 'data';
		const contentType = 'contentType';
		const contentDisposition = 'contentDisposition';
		const contentEncoding = 'contentEncoding';
		const metadata = { key: 'value' };
		const onProgress = jest.fn();
		const useAccelerateEndpoint = true;

		const job = putObjectJob(
			{
				key,
				data,
				options: {
					contentDisposition,
					contentEncoding,
					contentType,
					metadata,
					onProgress,
					useAccelerateEndpoint,
				},
			},
			abortController.signal
		);
		const result = await job();
		expect(result).toEqual({
			key,
			eTag: 'eTag',
			versionId: 'versionId',
			contentType: 'contentType',
			metadata: { key: 'value' },
			size: undefined,
		});
		expect(mockPutObject).toBeCalledWith(
			{
				credentials,
				region: 'region',
				abortSignal: abortController.signal,
				onUploadProgress: expect.any(Function),
				useAccelerateEndpoint: true,
			},
			{
				Bucket: 'bucket',
				Key: `public/${key}`,
				Body: data,
				ContentType: contentType,
				ContentDisposition: contentDisposition,
				ContentEncoding: contentEncoding,
				Metadata: metadata,
				ContentMD5: undefined,
			}
		);
	});

	it('should set ContentMD5 if object lock is enabled', async () => {
		AmplifyV6.libraryOptions = {
			Storage: {
				AWSS3: {
					isObjectLockEnabled: true,
				},
			},
		};
		const job = putObjectJob(
			{
				key: 'key',
				data: 'data',
			},
			new AbortController().signal
		);
		await job();
		expect(calculateContentMd5).toBeCalledWith('data');
	});
});
