// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyClassV6 } from '@aws-amplify/core';

import { remove as advancedRemove } from '../../../src/internals';
import { remove as removeInternal } from '../../../src/providers/s3/apis/internal/remove';

jest.mock('../../../src/providers/s3/apis/internal/remove');
const mockedRemoveInternal = jest.mocked(removeInternal);

describe('remove (internal)', () => {
	beforeEach(() => {
		mockedRemoveInternal.mockResolvedValue({
			path: 'output/path/to/mock/object',
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should pass advanced option locationCredentialsProvider to internal remove', async () => {
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

		const result = await advancedRemove({
			path: 'input/path/to/mock/object',
			options: {
				useAccelerateEndpoint,
				bucket,
				expectedBucketOwner,
				locationCredentialsProvider,
			},
		});

		expect(mockedRemoveInternal).toHaveBeenCalledTimes(1);
		expect(mockedRemoveInternal).toHaveBeenCalledWith(
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
