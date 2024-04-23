// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import {
	RemoveInput,
	RemoveOutput,
	RemoveWithPathInput,
	RemoveWithPathOutput,
} from '../../types';
import { remove as removeInternal } from '../internal/remove';

/**
 * Remove a file from your S3 bucket.
 * @param input - The `RemoveWithPathInput` object.
 * @param contextSpec - The context spec used to get the Amplify server context.
 * @return Output containing the removed object path.
 * @throws service: `S3Exception` - S3 service errors thrown while while removing the object.
 * @throws validation: `StorageValidationErrorCode` - Validation errors thrown
 * when there is no path or path is empty or path has a leading slash.
 */
export function remove(
	contextSpec: AmplifyServer.ContextSpec,
	input: RemoveWithPathInput,
): Promise<RemoveWithPathOutput>;
/**
 * @deprecated The `key` and `accessLevel` parameters are deprecated and may be removed in the next major version.
 * Please use {@link https://docs.amplify.aws/react/build-a-backend/storage/remove | path} instead.
 *
 * Remove a file from your S3 bucket.
 * @param input - The `RemoveInput` object.
 * @param contextSpec - The context spec used to get the Amplify server context.
 * @return Output containing the removed object key
 * @throws service: `S3Exception` - S3 service errors thrown while while removing the object
 * @throws validation: `StorageValidationErrorCode` - Validation errors thrown
 * when there is no key or its empty.
 */
export function remove(
	contextSpec: AmplifyServer.ContextSpec,
	input: RemoveInput,
): Promise<RemoveOutput>;

export function remove(
	contextSpec: AmplifyServer.ContextSpec,
	input: RemoveInput | RemoveWithPathInput,
) {
	return removeInternal(getAmplifyServerContext(contextSpec).amplify, input);
}
