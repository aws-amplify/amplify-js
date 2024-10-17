// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { uploadData as advancedUploadData } from '../../../src/internals';
import { uploadData as uploadDataInternal } from '../../../src/providers/s3/apis/internal/uploadData';

jest.mock('../../../src/providers/s3/apis/internal/uploadData');
const mockedUploadDataInternal = jest.mocked(uploadDataInternal);
const mockedUploadTask = 'UPLOAD_TASK';

describe('uploadData (internal)', () => {
	beforeEach(() => {
		mockedUploadDataInternal.mockReturnValue(mockedUploadTask as any);
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
		const contentDisposition = { type: 'attachment', filename: 'foo' } as const;
		const onProgress = jest.fn();
		const metadata = { foo: 'bar' };

		const result = advancedUploadData({
			path: 'input/path/to/mock/object',
			data: 'data',
			options: {
				useAccelerateEndpoint,
				bucket,
				locationCredentialsProvider,
				contentDisposition,
				contentEncoding: 'gzip',
				contentType: 'text/html',
				onProgress,
				metadata,
				expectedBucketOwner,
			},
		});

		expect(mockedUploadDataInternal).toHaveBeenCalledTimes(1);
		expect(mockedUploadDataInternal).toHaveBeenCalledWith({
			path: 'input/path/to/mock/object',
			data: 'data',
			options: {
				useAccelerateEndpoint,
				bucket,
				locationCredentialsProvider,
				contentDisposition,
				contentEncoding: 'gzip',
				contentType: 'text/html',
				onProgress,
				metadata,
				expectedBucketOwner,
			},
		});
		expect(result).toEqual(mockedUploadTask);
	});
});
