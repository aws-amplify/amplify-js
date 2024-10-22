// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyClassV6 } from '@aws-amplify/core';

import { copy as advancedCopy } from '../../../src/internals';
import { copy as copyInternal } from '../../../src/providers/s3/apis/internal/copy';

jest.mock('../../../src/providers/s3/apis/internal/copy');
const mockedCopyInternal = jest.mocked(copyInternal);

describe('copy (internals)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockedCopyInternal.mockResolvedValue({
			path: 'output/path/to/mock/object',
		});
	});

	it('should pass advanced option locationCredentialsProvider to internal list', async () => {
		const locationCredentialsProvider = async () => ({
			credentials: {
				accessKeyId: 'akid',
				secretAccessKey: 'secret',
				sessionToken: 'token',
				expiration: new Date(),
			},
		});
		const copyInputWithAdvancedOptions = {
			source: {
				path: 'path/to/object',
				bucket: 'bucket',
				eTag: 'eTag',
				notModifiedSince: new Date(),
				expectedBucketOwner: '012345678901',
			},
			destination: {
				path: 'path/to/object',
				bucket: 'bucket',
				expectedBucketOwner: '212345678901',
			},
			options: {
				locationCredentialsProvider,
			},
		};
		const result = await advancedCopy(copyInputWithAdvancedOptions);
		expect(mockedCopyInternal).toHaveBeenCalledTimes(1);
		expect(mockedCopyInternal).toHaveBeenCalledWith(
			expect.any(AmplifyClassV6),
			copyInputWithAdvancedOptions,
		);
		expect(result).toEqual({
			path: 'output/path/to/mock/object',
		});
	});
});
