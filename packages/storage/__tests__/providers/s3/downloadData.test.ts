// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Credentials } from '@aws-sdk/types';
import { AmplifyV6 } from '@aws-amplify/core';
import { getObject } from '../../../src/AwsClients/S3';
import { downloadData } from '../../../src/providers/s3';
import { createDownloadTask } from '../../../src/utils/transferTask';

jest.mock('../../../src/AwsClients/S3');
jest.mock('../../../src/utils/transferTask');
jest.mock('@aws-amplify/core', () => {
	const core = jest.requireActual('@aws-amplify/core');
	return {
		...core,
		AmplifyV6: {
			...core.AmplifyV6,
			Auth: {
				fetchAuthSession: jest.fn(),
			},
			getConfig: jest.fn(),
		},
	};
});
const credentials: Credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const identityId = 'identityId';

// TODO: test validation errors
describe('downloadData', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	const mockCreateDownloadTask = createDownloadTask as jest.Mock;
	mockCreateDownloadTask.mockReturnValue('downloadTask');
	(AmplifyV6.Auth.fetchAuthSession as jest.Mock).mockResolvedValue({
		credentials,
		identityId,
	});
	(AmplifyV6.getConfig as jest.Mock).mockReturnValue({
		Storage: {
			bucket: 'bucket',
			region: 'region',
		},
	});

	it('should return a download task', async () => {
		expect(downloadData({ key: 'key' })).toBe('downloadTask');
	});

	it('should supply the correct parameters to getObject API handler', async () => {
		expect.assertions(2);
		(getObject as jest.Mock).mockResolvedValueOnce({ Body: 'body' });
		const onProgress = jest.fn();
		downloadData({
			key: 'key',
			options: {
				targetIdentityId: 'targetIdentityId',
				accessLevel: 'protected',
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
				Key: 'protected/targetIdentityId/key',
			}
		);
	});

	it('should assign the getObject API handler response to the result', async () => {
		expect.assertions(2);
		(getObject as jest.Mock).mockResolvedValueOnce({
			Body: 'body',
			LastModified: 'lastModified',
			ContentLength: 'contentLength',
			ETag: 'eTag',
			Metadata: 'metadata',
			VersionId: 'versionId',
			ContentType: 'contentType',
		});
		downloadData({ key: 'key' });
		const job = mockCreateDownloadTask.mock.calls[0][0].job;
		const result = await job();
		expect(getObject).toBeCalledTimes(1);
		expect(result).toEqual({
			body: 'body',
			lastModified: 'lastModified',
			size: 'contentLength',
			eTag: 'eTag',
			metadata: 'metadata',
			versionId: 'versionId',
			contentType: 'contentType',
		});
	});
});
