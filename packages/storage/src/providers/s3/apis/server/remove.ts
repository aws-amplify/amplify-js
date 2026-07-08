// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { AmplifyServer } from '@aws-amplify/core/internals/adapter-core';

import {
	RemoveInput,
	RemoveOperation,
	RemoveOutput,
	RemoveWithPathInput,
	RemoveWithPathOutput,
} from '../../types';
import { remove as removeInternal } from '../internal/remove';

import { resolveServerContext } from './resolveServerContext';

/**
 * Remove a file or folder from your S3 bucket.
 * @param input - The `RemoveWithPathInput` object.
 * @param ctxOrContextSpec - The context spec used to get the Amplify server context.
 * @return Operation handle with result promise and cancellation capability.
 * @throws service: `S3Exception` - S3 service errors thrown while while removing the object.
 * @throws validation: `StorageValidationErrorCode` - Validation errors thrown
 * when there is no path or path is empty or path has a leading slash.
 */
export function remove(
	ctxOrContextSpec: AmplifyContext | AmplifyServer.ContextSpec,
	input: RemoveWithPathInput,
): RemoveOperation<RemoveWithPathOutput>;
/**
 * @deprecated The `key` and `accessLevel` parameters are deprecated and may be removed in the next major version.
 * Please use {@link https://docs.amplify.aws/react/build-a-backend/storage/remove | path} instead.
 *
 * Remove a file from your S3 bucket.
 * @param input - The `RemoveInput` object.
 * @param ctxOrContextSpec - The context spec used to get the Amplify server context.
 * @return Operation handle with result promise and cancellation capability.
 * @throws service: `S3Exception` - S3 service errors thrown while while removing the object
 * @throws validation: `StorageValidationErrorCode` - Validation errors thrown
 * when there is no key or its empty.
 */
export function remove(
	ctxOrContextSpec: AmplifyContext | AmplifyServer.ContextSpec,
	input: RemoveInput,
): RemoveOperation<RemoveOutput>;

export function remove(
	ctxOrContextSpec: AmplifyContext | AmplifyServer.ContextSpec,
	input: RemoveInput | RemoveWithPathInput,
) {
	const ctx = resolveServerContext(ctxOrContextSpec);
	if ('key' in input) {
		return removeInternal(ctx, input);
	} else {
		return removeInternal(ctx, input);
	}
}
