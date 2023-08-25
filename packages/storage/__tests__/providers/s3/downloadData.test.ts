// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Credentials } from '@aws-sdk/types';
import { AmplifyV6, fetchAuthSession } from '@aws-amplify/core';
import { getObject } from '../../../src/AwsClients/S3';
import { downloadData } from '../../../src/providers/s3';
import { createDownloadTask } from '../../../src/providers/s3/utils';

jest.mock('../../../src/AwsClients/S3');
jest.mock('../../../src/providers/s3/utils');
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
const mockCreateDownloadTask = createDownloadTask as jest.Mock;

// TODO: test validation errors
// TODO: test downloadData from guest, private, protected access level respectively.
describe('downloadData', () => {
	beforeAll(() => {
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
	});
	mockCreateDownloadTask.mockReturnValue('downloadTask');

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should return a download task', async () => {
		expect(downloadData({ key: 'key' })).toBe('downloadTask');
	});

	it('should supply the correct parameters to getObject API handler', async () => {
		expect.assertions(2);
		(getObject as jest.Mock).mockResolvedValueOnce({ Body: 'body' });
		const onProgress = jest.fn();
		const targetIdentityId = 'targetIdentityId';
		const accessLevel = 'protected';
		const key = 'key';
		downloadData({
			key,
			options: {
				targetIdentityId,
				accessLevel,
				useAccelerateEndpoint: true,
				onProgress,
			},
		});
		const job = mockCreateDownloadTask.mock.calls[0][0].job;
		await job();
		expect(getObject).toBeCalledTimes(1);
		expect(getObject).toHaveBeenCalledWith(
			{
				credentials,
				region: 'region',
				useAccelerateEndpoint: true,
				onDownloadProgress: onProgress,
				abortSignal: expect.any(AbortSignal),
			},
			{
				Bucket: 'bucket',
				Key: `${accessLevel}/${targetIdentityId}/${key}`,
			}
		);
	});

	it('should assign the getObject API handler response to the result', async () => {
		expect.assertions(2);
		const lastModified = 'lastModified';
		const contentLength = 'contentLength';
		const eTag = 'eTag';
		const metadata = 'metadata';
		const versionId = 'versionId';
		const contentType = 'contentType';
		const body = 'body';
		const key = 'key';
		(getObject as jest.Mock).mockResolvedValueOnce({
			Body: body,
			LastModified: lastModified,
			ContentLength: contentLength,
			ETag: eTag,
			Metadata: metadata,
			VersionId: versionId,
			ContentType: contentType,
		});
		downloadData({ key });
		const job = mockCreateDownloadTask.mock.calls[0][0].job;
		const result = await job();
		expect(getObject).toBeCalledTimes(1);
		expect(result).toEqual({
			key,
			body,
			lastModified,
			size: contentLength,
			eTag,
			metadata,
			versionId,
			contentType,
		});
	});
});
