// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { copy as copyInternal } from '../../providers/s3/apis/internal/copy';
import { CopyInput } from '../types/inputs';
import { CopyOutput } from '../types/outputs';

/**
 * @internal
 */
export const copy = (input: CopyInput) =>
	copyInternal(Amplify, {
		source: {
			path: input.source.path,
			bucket: input.source.bucket,
			eTag: input.source.eTag,
			notModifiedSince: input.source.notModifiedSince,
			expectedBucketOwner: input.source.expectedBucketOwner,
		},
		destination: {
			path: input.destination.path,
			bucket: input.destination.bucket,
			expectedBucketOwner: input.destination.expectedBucketOwner,
		},
		options: {
			// Advanced options
			locationCredentialsProvider: input.options?.locationCredentialsProvider,
			customEndpoint: input?.options?.customEndpoint,
		},
		// Type casting is necessary because `copyInternal` supports both Gen1 and Gen2 signatures, but here
		// given in input can only be Gen2 signature, the return can only ben Gen2 signature.
	}) as Promise<CopyOutput>;
