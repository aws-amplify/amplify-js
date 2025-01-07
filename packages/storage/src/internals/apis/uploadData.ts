// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UploadDataInput } from '../types/inputs';
import { UploadDataOutput } from '../types/outputs';
import { uploadData as uploadDataInternal } from '../../providers/s3/apis/internal/uploadData';

/**
 * @internal
 */
export const uploadData = (input: UploadDataInput) => {
	const { data, path, options } = input;

	return uploadDataInternal({
		path,
		data,
		options: {
			useAccelerateEndpoint: options?.useAccelerateEndpoint,
			bucket: options?.bucket,
			onProgress: options?.onProgress,
			contentDisposition: options?.contentDisposition,
			contentEncoding: options?.contentEncoding,
			contentType: options?.contentType,
			metadata: options?.metadata,
			preventOverwrite: options?.preventOverwrite,
			expectedBucketOwner: options?.expectedBucketOwner,
			checksumAlgorithm: options?.checksumAlgorithm,

			// Advanced options
			locationCredentialsProvider: options?.locationCredentialsProvider,
			customEndpoint: options?.customEndpoint,
		},
		// Type casting is necessary because `uploadDataInternal` supports both Gen1 and Gen2 signatures, but here
		// given in input can only be Gen2 signature, the return can only ben Gen2 signature.
	}) as UploadDataOutput;
};
