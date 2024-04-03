// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import {
	RemoveInput,
	RemoveInputWithKey,
	RemoveInputWithPath,
	RemoveOutput,
	RemoveOutputWithKey,
	RemoveOutputWithPath,
} from '../../types';
import { remove as removeInternal } from '../internal/remove';

interface RemoveApi {
	/**
	 * Remove a file from your S3 bucket.
	 * @param input - The `RemoveInputWithPath` object.
	 * @param contextSpec - The context spec used to get the Amplify server context.
	 * @return Output containing the removed object path.
	 * @throws service: `S3Exception` - S3 service errors thrown while while removing the object.
	 * @throws validation: `StorageValidationErrorCode` - Validation errors thrown
	 * when there is no path or path is empty or path has a leading slash.
	 */
	(
		contextSpec: AmplifyServer.ContextSpec,
		input: RemoveInputWithPath,
	): Promise<RemoveOutputWithPath>;
	/**
	 * @deprecated The `key` and `accessLevel` parameters are deprecated and may be removed in the next major version.
	 * Please use {@link https://docs.amplify.aws/react/build-a-backend/storage/remove | path} instead.
	 *
	 * Remove a file from your S3 bucket.
	 * @param input - The `RemoveInputWithKey` object.
	 * @param contextSpec - The context spec used to get the Amplify server context.
	 * @return Output containing the removed object key
	 * @throws service: `S3Exception` - S3 service errors thrown while while removing the object
	 * @throws validation: `StorageValidationErrorCode` - Validation errors thrown
	 * when there is no key or its empty.
	 */
	(
		contextSpec: AmplifyServer.ContextSpec,
		input: RemoveInputWithKey,
	): Promise<RemoveOutputWithKey>;
	(
		contextSpec: AmplifyServer.ContextSpec,
		input: RemoveInputWithPath | RemoveInputWithKey,
	): Promise<RemoveOutput>;
}

export const remove: RemoveApi = <Output extends RemoveOutput>(
	contextSpec: AmplifyServer.ContextSpec,
	input: RemoveInput,
): Promise<Output> =>
	removeInternal(
		getAmplifyServerContext(contextSpec).amplify,
		input,
	) as Promise<Output>;
