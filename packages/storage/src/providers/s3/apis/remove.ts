// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import {
	RemoveInput,
	RemoveInputWithKey,
	RemoveInputWithPath,
	RemoveOutput,
	RemoveOutputWithKey,
	RemoveOutputWithPath,
} from '../types';

import { remove as removeInternal } from './internal/remove';

interface RemoveApi {
	/**
	 * Remove a file from your S3 bucket.
	 * @param input - The `RemoveInputWithPath` object.
	 * @return Output containing the removed object path.
	 * @throws service: `S3Exception` - S3 service errors thrown while while removing the object.
	 * @throws validation: `StorageValidationErrorCode` - Validation errors thrown
	 * when there is no path or path is empty or path has a leading slash.
	 */
	(input: RemoveInputWithPath): Promise<RemoveOutputWithPath>;
	/**
	 * @deprecated The `key` and `accessLevel` parameters are deprecated and may be removed in the next major version.
	 * Please use {@link https://docs.amplify.aws/react/build-a-backend/storage/remove | path} instead.
	 *
	 * Remove a file from your S3 bucket.
	 * @param input - The `RemoveInputWithKey` object.
	 * @return Output containing the removed object key
	 * @throws service: `S3Exception` - S3 service errors thrown while while removing the object
	 * @throws validation: `StorageValidationErrorCode` - Validation errors thrown
	 * when there is no key or its empty.
	 */
	(input: RemoveInputWithKey): Promise<RemoveOutputWithKey>;
}

export const remove: RemoveApi = <Output extends RemoveOutput>(
	input: RemoveInput,
): Promise<Output> => removeInternal(Amplify, input) as Promise<Output>;
