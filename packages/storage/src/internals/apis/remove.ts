// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { remove as removeInternal } from '../../providers/s3/apis/internal/remove';
import { RemoveInput } from '../types/inputs';
import { RemoveOutput } from '../types/outputs';

/**
 * @internal
 */
export const remove = (input: RemoveInput): Promise<RemoveOutput> =>
	removeInternal(Amplify, {
		path: input.path,
		options: {
			useAccelerateEndpoint: input?.options?.useAccelerateEndpoint,
			bucket: input?.options?.bucket,
			expectedBucketOwner: input?.options?.expectedBucketOwner,
			locationCredentialsProvider: input?.options?.locationCredentialsProvider,
			customEndpoint: input?.options?.customEndpoint,
		},
		// Type casting is necessary because `removeInternal` supports both Gen1 and Gen2 signatures, but here
		// given in input can only be Gen2 signature, the return can only ben Gen2 signature.
	}) as Promise<RemoveOutput>;
