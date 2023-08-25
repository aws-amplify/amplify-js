// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getProperties, getUrl } from '../../../src/providers/s3/apis';
import { Credentials } from '@aws-sdk/types';
import { Amplify } from '@aws-amplify/core';
import {
	getPresignedGetObjectUrl,
	headObject,
} from '../../../src/AwsClients/S3';

jest.mock('../../../src/AwsClients/S3');

jest.mock('../../../src/AwsClients/S3');
jest.mock('@aws-amplify/core', () => {
	const core = jest.requireActual('@aws-amplify/core');
	return {
		...core,
		fetchAuthSession: jest.fn(),
		Amplify: {
			...core.Amplify,
			getConfig: jest.fn(),
			Auth: {
				...core.Amplify.Auth,
				fetchAuthSession: jest.fn(),
			},
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

	(Amplify.Auth.fetchAuthSession as jest.Mock).mockResolvedValue({
		credentials,
		identityId: targetIdentityId,
	});

	(Amplify.getConfig as jest.Mock).mockReturnValue({
		Storage: {
			bucket,
			region,
		},
	});
	it('get presigned url happy case', async () => {
		expect.assertions(2);
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
		const result = await getUrl({ key: 'key' });
		expect(getPresignedGetObjectUrl).toBeCalledTimes(1);
		expect(result.url).toEqual({
			url: new URL('https://google.com'),
		});
	});
	test('Should return not found error when the object is not found', async () => {
		(headObject as jest.Mock).mockImplementation(() =>
			Object.assign(new Error(), {
				$metadata: { httpStatusCode: 404 },
				name: 'NotFound',
			})
		);
		try {
			await getUrl({
				key: 'invalid_key',
				options: { validateObjectExistence: true },
			});
		} catch (error) {
			expect.assertions(2);
			expect(headObject).toBeCalledTimes(1);
			expect(error.$metadata?.httpStatusCode).toBe(404);
		}
	});
});
