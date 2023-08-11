// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ICredentials } from '@aws-amplify/core';
import { headObject } from '../../../src/AwsClients/S3';
import { getProperties } from '../../../src/providers/s3';
import { StorageOptions } from '../../../src/types/Storage';
import { resolveCredentials } from '../../../src/providers/s3/utils';

jest.mock('../../../src/AwsClients/S3');
const mockHeadObject = headObject as jest.Mock;
const credentials: ICredentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
	identityId: 'identityId',
	authenticated: true,
};
const options: StorageOptions = {
	bucket: 'bucket',
	region: 'region',
	credentials,
	level: 'public',
};

describe('getProperties happy path case', () => {
	test.skip('getProperties return result', async () => {
		mockHeadObject.mockReturnValueOnce({
			ContentLength: '100',
			ContentType: 'text/plain',
			ETag: 'etag',
			LastModified: 'last-modified',
			Metadata: { key: 'value' },
			VersionId: 'version-id',
		});
		expect(await getProperties({ key: 'key' })).toEqual({
			key: 'key',
			contentLength: '100',
			contentType: 'text/plain',
			eTag: 'etag',
			lastModified: 'last-modified',
			versionId: 'version-id',
		});
	});
});

describe('getProperties error path case', () => {
	test.skip('getProperties should return a not found error', async () => {
		// TODO test credentials
		mockHeadObject.mockRejectedValueOnce(
			Object.assign(new Error(), {
				$metadata: { httpStatusCode: 404 },
				name: 'NotFound',
			})
		);
		try {
			await getProperties({ key: 'keyed' });
		} catch (error) {
			expect(error.$metadata.httpStatusCode).toBe(404);
		}
	});
});
