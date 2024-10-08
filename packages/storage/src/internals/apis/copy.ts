// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { copy as copyInternal } from '../../providers/s3/apis/internal/copy';
import { CopyInput } from '../types/inputs';
import { CopyWithPathOutput } from '../../providers/s3';

/**
 * @internal
 * Copy an object from a source to a destination object within the same bucket.
 *
 * @param input - The `CopyInput` object.
 * @returns Output containing the destination object path.
 * @throws service: `S3Exception` - Thrown when checking for existence of the object
 * @throws validation: `StorageValidationErrorCode` - Thrown when
 * source or destination path is not defined.
 */
export function copy(input: CopyInput) {
	return copyInternal(Amplify, {
		source: input.source,
		destination: input.destination,
		options: {
			// Advanced options
			locationCredentialsProvider: input.options?.locationCredentialsProvider,
		},
		// Type casting is necessary because `copyInternal` supports both Gen1 and Gen2 signatures, but here
		// given in input can only be Gen2 signature, the return can only ben Gen2 signature.
	}) as Promise<CopyWithPathOutput>;
}
