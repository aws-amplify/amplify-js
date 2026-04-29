// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';
import { list as advancedList } from '../../../src/internals';
import { list as listInternal } from '../../../src/providers/s3/apis/internal/list';

jest.mock('../../../src/providers/s3/apis/internal/list');
const mockedListInternal = jest.mocked(listInternal);

const mockCtx = createMockAmplifyContext();

describe('list (internals)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockedListInternal.mockResolvedValue({
			items: [],
		});
	});

	it('should pass advanced option locationCredentialsProvider to internal list', async () => {
		const useAccelerateEndpoint = true;
		const expectedBucketOwner = '012345678901';
		const bucket = { bucketName: 'bucket', region: 'us-east-1' };
		const customEndpoint = 's3.dualstack.us-east-2.amazonaws.com';
		const locationCredentialsProvider = async () => ({
			credentials: {
				accessKeyId: 'akid',
				secretAccessKey: 'secret',
				sessionToken: 'token',
				expiration: new Date(),
			},
		});
		const result = await advancedList(mockCtx, {
			path: 'input/path/to/mock/object',
			options: {
				customEndpoint,
				useAccelerateEndpoint,
				bucket,
				expectedBucketOwner,
				locationCredentialsProvider,
			},
		});
		expect(mockedListInternal).toHaveBeenCalledTimes(1);
		expect(mockedListInternal).toHaveBeenCalledWith(mockCtx, {
			path: 'input/path/to/mock/object',
			options: {
				customEndpoint,
				useAccelerateEndpoint,
				bucket,
				expectedBucketOwner,
				locationCredentialsProvider,
			},
		});
		expect(result).toEqual({
			items: [],
		});
	});
});
