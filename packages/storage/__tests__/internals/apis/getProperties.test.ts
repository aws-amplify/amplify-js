// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyClassV6 } from '@aws-amplify/core';

import { getProperties as advancedGetProperties } from '../../../src/internals';
import { getProperties as getPropertiesInternal } from '../../../src/providers/s3/apis/internal/getProperties';

jest.mock('../../../src/providers/s3/apis/internal/getProperties');
const mockedGetPropertiesInternal = jest.mocked(getPropertiesInternal);

describe('getProperties (internal)', () => {
	beforeEach(() => {
		mockedGetPropertiesInternal.mockResolvedValue({
			path: 'output/path/to/mock/object',
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should pass advanced option locationCredentialsProvider to internal getProperties', async () => {
		const useAccelerateEndpoint = true;
		const expectedBucketOwner = '012345678901';
		const bucket = { bucketName: 'bucket', region: 'us-east-1' };
		const locationCredentialsProvider = async () => ({
			credentials: {
				accessKeyId: 'akid',
				secretAccessKey: 'secret',
				sessionToken: 'token',
				expiration: new Date(),
			},
		});
		const result = await advancedGetProperties({
			path: 'input/path/to/mock/object',
			options: {
				useAccelerateEndpoint,
				bucket,
				expectedBucketOwner,
				locationCredentialsProvider,
			},
		});
		expect(mockedGetPropertiesInternal).toHaveBeenCalledTimes(1);
		expect(mockedGetPropertiesInternal).toHaveBeenCalledWith(
			expect.any(AmplifyClassV6),
			{
				path: 'input/path/to/mock/object',
				options: {
					useAccelerateEndpoint,
					bucket,
					expectedBucketOwner,
					locationCredentialsProvider,
				},
			},
		);
		expect(result).toEqual({
			path: 'output/path/to/mock/object',
		});
	});
});
