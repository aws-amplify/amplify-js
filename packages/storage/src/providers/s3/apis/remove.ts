// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import {
	RemoveInput,
	RemoveInputKey,
	RemoveInputPath,
	RemoveOutput,
	RemoveOutputKey,
	RemoveOutputPath,
} from '../types';

import { remove as removeInternal } from './internal/remove';

interface RemoveApi {
	/**
	 * Remove a file from your S3 bucket.
	 * @param input - The `RemoveInputPath` object.
	 * @return Output containing the removed object path.
	 * @throws service: `S3Exception` - S3 service errors thrown while while removing the object.
	 * @throws validation: `StorageValidationErrorCode` - Validation errors thrown
	 * when there is no path or path is empty or path has a leading slash.
	 */
	(input: RemoveInputPath): Promise<RemoveOutputPath>;
	/**
	 * @deprecated The `key` and `accessLevel` parameters are deprecated and may be removed in the next major version.
	 * Please use {@link https://docs.amplify.aws/react/build-a-backend/storage/remove | path} instead.
	 *
	 * Remove a file from your S3 bucket.
	 * @param input - The `RemoveInputKey` object.
	 * @return Output containing the removed object key
	 * @throws service: `S3Exception` - S3 service errors thrown while while removing the object
	 * @throws validation: `StorageValidationErrorCode` - Validation errors thrown
	 * when there is no key or its empty.
	 */
	(input: RemoveInputKey): Promise<RemoveOutputKey>;
}

export const remove: RemoveApi = <Output extends RemoveOutput>(
	input: RemoveInput,
): Promise<Output> => {
	return removeInternal(Amplify, input) as Promise<Output>;
};
