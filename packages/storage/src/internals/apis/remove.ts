// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyContext,
	getGlobalContext,
	isAmplifyContext,
} from '@aws-amplify/core';

import { remove as removeInternal } from '../../providers/s3/apis/internal/remove';
import { RemoveOperation } from '../../providers/s3/types';
import { RemoveInput } from '../types/inputs';
import { RemoveOutput } from '../types/outputs';

/**
 * @internal
 */
export function remove(
	ctx: AmplifyContext,
	input: RemoveInput,
): RemoveOperation<RemoveOutput>;
/**
 * @internal
 */
export function remove(input: RemoveInput): RemoveOperation<RemoveOutput>;
export function remove(
	ctxOrInput: AmplifyContext | RemoveInput,
	maybeInput?: RemoveInput,
): RemoveOperation<RemoveOutput> {
	// Resolve the optional leading context. The global context is resolved at
	// CALL time (never cached) so single-arg callers follow live configuration.
	const [ctx, input]: [AmplifyContext, RemoveInput] = isAmplifyContext(
		ctxOrInput,
	)
		? [ctxOrInput, maybeInput as RemoveInput]
		: [getGlobalContext(), ctxOrInput];

	return removeInternal(
		ctx,
		{
			path: input.path,
			options: {
				useAccelerateEndpoint: input?.options?.useAccelerateEndpoint,
				bucket: input?.options?.bucket,
				expectedBucketOwner: input?.options?.expectedBucketOwner,
				locationCredentialsProvider:
					input?.options?.locationCredentialsProvider,
				customEndpoint: input?.options?.customEndpoint,
				onProgress: input?.options?.onProgress,
			},
		},
		// Type casting is necessary because `removeInternal` supports both Gen1 and Gen2 signatures, but here
		// given in input can only be Gen2 signature, the return can only ben Gen2 signature.
	) as RemoveOperation<RemoveOutput>;
}
