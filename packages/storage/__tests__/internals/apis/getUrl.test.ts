// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyClassV6 } from '@aws-amplify/core';

import { getUrl as advancedGetUrl } from '../../../src/internals';
import { getUrl as getUrlInternal } from '../../../src/providers/s3/apis/internal/getUrl';

jest.mock('../../../src/providers/s3/apis/internal/getUrl');
const mockedGetUrlInternal = jest.mocked(getUrlInternal);

const MOCK_URL = new URL('https://s3.aws/mock-presigned-url');
const MOCK_DATE = new Date();
MOCK_DATE.setMonth(MOCK_DATE.getMonth() + 1);

describe('getUrl (internal)', () => {
	beforeEach(() => {
		mockedGetUrlInternal.mockResolvedValue({
			url: MOCK_URL,
			expiresAt: MOCK_DATE,
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through advanced options to the internal getUrl', async () => {
		const useAccelerateEndpoint = true;
		const validateObjectExistence = false;
		const expectedBucketOwner = '012345678901';
		const expiresIn = 300; // seconds
		const contentDisposition = 'inline; filename="example.jpg"';
		const contentType = 'image/jpeg';
		const bucket = { bucketName: 'bucket', region: 'us-east-1' };
		const locationCredentialsProvider = async () => ({
			credentials: {
				accessKeyId: 'akid',
				secretAccessKey: 'secret',
				sessionToken: 'token',
				expiration: new Date(),
			},
		});
		const result = await advancedGetUrl({
			path: 'input/path/to/mock/object',
			options: {
				useAccelerateEndpoint,
				bucket,
				validateObjectExistence,
				expiresIn,
				contentDisposition,
				contentType,
				expectedBucketOwner,
				locationCredentialsProvider,
			},
		});
		expect(mockedGetUrlInternal).toHaveBeenCalledTimes(1);
		expect(mockedGetUrlInternal).toHaveBeenCalledWith(
			expect.any(AmplifyClassV6),
			{
				path: 'input/path/to/mock/object',
				options: {
					useAccelerateEndpoint,
					bucket,
					validateObjectExistence,
					expiresIn,
					contentDisposition,
					contentType,
					expectedBucketOwner,
					locationCredentialsProvider,
				},
			},
		);
		expect(result).toEqual({
			url: MOCK_URL,
			expiresAt: MOCK_DATE,
		});
	});
});
