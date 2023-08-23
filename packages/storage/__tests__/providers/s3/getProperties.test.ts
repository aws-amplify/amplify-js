// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { headObject } from '../../../src/AwsClients/S3';
import { getProperties } from '../../../src/providers/s3';
import { Credentials } from '@aws-sdk/types';
import { AmplifyV6, fetchAuthSession } from '@aws-amplify/core';

jest.mock('../../../src/AwsClients/S3');
const mockHeadObject = headObject as jest.Mock;

jest.mock('@aws-amplify/core', () => {
	const core = jest.requireActual('@aws-amplify/core');
	return {
		...core,
		fetchAuthSession: jest.fn(),
		AmplifyV6: {
			...core.AmplifyV6,
			getConfig: jest.fn(),
		},
	};
});

const bucket = 'bucket';
const region = 'region';
const credentials: Credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const targetIdentityId = 'targetIdentityId';

describe('getProperties test', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	(fetchAuthSession as jest.Mock).mockResolvedValue({
		credentials,
		identityId: targetIdentityId,
	});
	(AmplifyV6.getConfig as jest.Mock).mockReturnValue({
		Storage: {
			bucket,
			region,
		},
	});
	it('getProperties happy path case with private check', async () => {
		expect.assertions(3);
		mockHeadObject.mockReturnValueOnce({
			ContentLength: '100',
			ContentType: 'text/plain',
			ETag: 'etag',
			LastModified: 'last-modified',
			Metadata: { key: 'value' },
			VersionId: 'version-id',
		});
		const metadata = { key: 'value' };
		expect(
			await getProperties({
				key: 'key',
				options: {
					targetIdentityId: 'targetIdentityId',
					accessLevel: 'protected',
				},
			})
		).toEqual({
			key: 'key',
			size: '100',
			contentType: 'text/plain',
			eTag: 'etag',
			metadata,
			lastModified: 'last-modified',
			versionId: 'version-id',
		});
		expect(headObject).toBeCalledTimes(1);
		expect(headObject).toHaveBeenCalledWith(
			{
				credentials,
				region: 'region',
			},
			{
				Bucket: 'bucket',
				Key: 'protected/targetIdentityId/key',
			}
		);
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
