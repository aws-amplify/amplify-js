// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { copy as copyInternal } from '../../providers/s3/apis/internal/copy';
import { CopyInput } from '../types/inputs';

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
	return copyInternal(Amplify, input);
}
