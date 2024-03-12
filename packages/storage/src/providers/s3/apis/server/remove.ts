// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import { RemoveInputKey, RemoveInputPath, RemoveOutput } from '../../types';
import { remove as removeInternal } from '../internal/remove';

interface RemoveApi {
	/**
	 * Remove a file from your S3 bucket.
	 * @param input - The RemoveInputKey object.
	 * @return Output containing the removed object key
	 * @throws service: {@link S3Exception} - S3 service errors thrown while getting properties
	 * @throws validation: {@link StorageValidationErrorCode } - Validation errors thrown
	 */
	(
		contextSpec: AmplifyServer.ContextSpec,
		input: RemoveInputKey,
	): Promise<RemoveOutput>;
	/**
	 * Remove a file from your S3 bucket.
	 * @param input - The RemoveInputPath object.
	 * @return Output containing the removed object path
	 * @throws service: {@link S3Exception} - S3 service errors thrown while getting properties
	 * @throws validation: {@link StorageValidationErrorCode } - Validation errors thrown
	 */
	(
		contextSpec: AmplifyServer.ContextSpec,
		input: RemoveInputPath,
	): Promise<RemoveOutput>;
}

export const remove: RemoveApi = (
	contextSpec: AmplifyServer.ContextSpec,
	input: RemoveInputKey | RemoveInputPath,
): Promise<RemoveOutput> => {
	return removeInternal(getAmplifyServerContext(contextSpec).amplify, input);
};
