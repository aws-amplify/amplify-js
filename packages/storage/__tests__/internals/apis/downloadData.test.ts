// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { downloadData as advancedDownloadData } from '../../../src/internals';
import { downloadData as downloadDataInternal } from '../../../src/providers/s3/apis/internal/downloadData';

jest.mock('../../../src/providers/s3/apis/internal/downloadData');
const mockedDownloadDataInternal = jest.mocked(downloadDataInternal);

describe('downloadData (internal)', () => {
	beforeEach(() => {
		mockedDownloadDataInternal.mockReturnValue({
			result: Promise.resolve({
				path: 'output/path/to/mock/object',
				body: {
					blob: () => Promise.resolve(new Blob()),
					json: () => Promise.resolve(''),
					text: () => Promise.resolve(''),
				},
			}),
			cancel: jest.fn(),
			state: 'SUCCESS',
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should pass advanced option locationCredentialsProvider to internal downloadData', async () => {
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
		const onProgress = jest.fn();
		const bytesRange = { start: 1024, end: 2048 };

		const output = await advancedDownloadData({
			path: 'input/path/to/mock/object',
			options: {
				useAccelerateEndpoint,
				bucket,
				locationCredentialsProvider,
				onProgress,
				bytesRange,
				expectedBucketOwner,
			},
		});

		expect(mockedDownloadDataInternal).toHaveBeenCalledTimes(1);
		expect(mockedDownloadDataInternal).toHaveBeenCalledWith({
			path: 'input/path/to/mock/object',
			options: {
				useAccelerateEndpoint,
				bucket,
				locationCredentialsProvider,
				onProgress,
				bytesRange,
				expectedBucketOwner,
			},
		});

		expect(await output.result).toEqual({
			path: 'output/path/to/mock/object',
			body: {
				blob: expect.any(Function),
				json: expect.any(Function),
				text: expect.any(Function),
			},
		});
	});
});
