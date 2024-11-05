// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { downloadData as downloadDataInternal } from '../../providers/s3/apis/internal/downloadData';
import { DownloadDataInput } from '../types/inputs';
import { DownloadDataOutput } from '../types/outputs';

/**
 * @internal
 */
export const downloadData = (input: DownloadDataInput): DownloadDataOutput =>
	downloadDataInternal({
		path: input.path,
		options: {
			useAccelerateEndpoint: input?.options?.useAccelerateEndpoint,
			bucket: input?.options?.bucket,
			locationCredentialsProvider: input?.options?.locationCredentialsProvider,
			bytesRange: input?.options?.bytesRange,
			onProgress: input?.options?.onProgress,
			expectedBucketOwner: input?.options?.expectedBucketOwner,
			customEndpoint: input?.options?.customEndpoint,
		},
		// Type casting is necessary because `downloadDataInternal` supports both Gen1 and Gen2 signatures, but here
		// given in input can only be Gen2 signature, the return can only ben Gen2 signature.
	}) as DownloadDataOutput;
