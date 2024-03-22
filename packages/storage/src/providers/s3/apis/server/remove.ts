// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import {
	RemoveInputKey,
	RemoveInputPath,
	RemoveOutput,
	RemoveOutputKey,
	RemoveOutputPath,
} from '../../types';
import { remove as removeInternal } from '../internal/remove';

interface RemoveApi {
	/**
	 * Remove a file from your S3 bucket.
	 * @param input - The `RemoveInputPath` object.
	 * @param contextSpec - The context spec used to get the Amplify server context.
	 * @return Output containing the removed object path.
	 * @throws service: `S3Exception` - S3 service errors thrown while while removing the object.
	 * @throws validation: `StorageValidationErrorCode` - Validation errors thrown
	 * when there is no path or path is empty or path has a leading slash.
	 */
	(
		contextSpec: AmplifyServer.ContextSpec,
		input: RemoveInputPath,
	): Promise<RemoveOutputPath>;
	/**
	 * @deprecated The `key` and `accessLevel` parameters are deprecated and may be removed in the next major version.
	 * Please use {@link https://docs.amplify.aws/react/build-a-backend/storage/remove | path} instead.
	 *
	 * Remove a file from your S3 bucket.
	 * @param input - The `RemoveInputKey` object.
	 * @param contextSpec - The context spec used to get the Amplify server context.
	 * @return Output containing the removed object key
	 * @throws service: `S3Exception` - S3 service errors thrown while while removing the object
	 * @throws validation: `StorageValidationErrorCode` - Validation errors thrown
	 * when there is no key or its empty.
	 */
	(
		contextSpec: AmplifyServer.ContextSpec,
		input: RemoveInputKey,
	): Promise<RemoveOutputKey>;
}

export const remove: RemoveApi = <Output extends RemoveOutput>(
	contextSpec: AmplifyServer.ContextSpec,
	input: RemoveInputKey | RemoveInputPath,
): Promise<Output> => {
	return removeInternal(
		getAmplifyServerContext(contextSpec).amplify,
		input,
	) as Promise<Output>;
};
