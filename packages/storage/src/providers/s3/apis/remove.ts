// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import {
	RemoveInput,
	RemoveOperation,
	RemoveOutput,
	RemoveWithPathInput,
	RemoveWithPathOutput,
} from '../types';

import { remove as removeInternal } from './internal/remove';

/**
 * Remove a file or folder from your S3 bucket.
 * @param input - The `RemoveWithPathInput` object.
 * @return Operation handle with result promise and cancellation capability.
 * @throws service: `S3Exception` - S3 service errors thrown while while removing the object.
 * @throws validation: `StorageValidationErrorCode` - Validation errors thrown
 * when there is no path or path is empty or path has a leading slash.
 */
export function remove(
	input: RemoveWithPathInput,
): RemoveOperation<RemoveWithPathOutput>;
/**
 * @deprecated The `key` and `accessLevel` parameters are deprecated and may be removed in the next major version.
 * Please use {@link https://docs.amplify.aws/react/build-a-backend/storage/remove | path} instead.
 *
 * Remove a file from your S3 bucket.
 * @param input - The `RemoveInput` object.
 * @return Operation handle with result promise and cancellation capability.
 * @throws service: `S3Exception` - S3 service errors thrown while while removing the object
 * @throws validation: `StorageValidationErrorCode` - Validation errors thrown
 * when there is no key or its empty.
 */
export function remove(input: RemoveInput): RemoveOperation<RemoveOutput>;

export function remove(input: RemoveInput | RemoveWithPathInput) {
	if ('key' in input) {
		return removeInternal(Amplify, input);
	} else {
		return removeInternal(Amplify, input);
	}
}
