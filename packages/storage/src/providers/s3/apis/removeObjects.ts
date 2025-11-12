// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { RemoveObjectsInput, RemoveObjectsOutput } from '../types';

import { removeObjects as removeObjectsInternal } from './internal/removeObjects';

/**
 * Remove multiple files from your S3 bucket in a single request.
 * @param input - The `RemoveObjectsInput` object containing paths to remove.
 * @return Output containing the removed object paths and any errors.
 * @throws service: `S3Exception` - S3 service errors thrown while removing objects.
 * @throws validation: `StorageValidationErrorCode` - Validation errors thrown
 * when there are no paths or paths are empty.
 */
export function removeObjects(
	input: RemoveObjectsInput,
): Promise<RemoveObjectsOutput> {
	return removeObjectsInternal(Amplify, input);
}
