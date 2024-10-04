// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { remove as removeInternal } from '../../providers/s3/apis/internal/remove';
import { RemoveInput } from '../types/inputs';
import { RemoveOutput } from '../types/outputs';

/**
 * Remove a file from your S3 bucket.
 * @param input - The `RemoveWithPathInput` object.
 * @return Output containing the removed object path.
 * @throws service: `S3Exception` - S3 service errors thrown while while removing the object.
 * @throws validation: `StorageValidationErrorCode` - Validation errors thrown
 * when there is no path or path is empty or path has a leading slash.
 *
 * @internal
 */
export const remove = (input: RemoveInput): Promise<RemoveOutput> =>
	removeInternal(Amplify, {
		path: input.path,
		options: {
			useAccelerateEndpoint: input?.options?.useAccelerateEndpoint,
			bucket: input?.options?.bucket,
			locationCredentialsProvider: input?.options?.locationCredentialsProvider,
		},
		// Type casting is necessary because `removeInternal` supports both Gen1 and Gen2 signatures, but here
		// given in input can only be Gen2 signature, the return can only ben Gen2 signature.
	}) as Promise<RemoveOutput>;
