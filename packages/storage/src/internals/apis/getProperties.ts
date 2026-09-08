// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyContext,
	getGlobalContext,
	isAmplifyContext,
} from '@aws-amplify/core';

import { getProperties as getPropertiesInternal } from '../../providers/s3/apis/internal/getProperties';
import { GetPropertiesInput } from '../types/inputs';
import { GetPropertiesOutput } from '../types/outputs';

/**
 * @internal
 */
export function getProperties(
	ctx: AmplifyContext,
	input: GetPropertiesInput,
): Promise<GetPropertiesOutput>;
/**
 * @internal
 */
export function getProperties(
	input: GetPropertiesInput,
): Promise<GetPropertiesOutput>;
export function getProperties(
	ctxOrInput: AmplifyContext | GetPropertiesInput,
	maybeInput?: GetPropertiesInput,
): Promise<GetPropertiesOutput> {
	// Resolve the optional leading context. The global context is resolved at
	// CALL time (never cached) so single-arg callers follow live configuration.
	const [ctx, input]: [AmplifyContext, GetPropertiesInput] = isAmplifyContext(
		ctxOrInput,
	)
		? [ctxOrInput, maybeInput as GetPropertiesInput]
		: [getGlobalContext(), ctxOrInput];

	return getPropertiesInternal(ctx, {
		path: input.path,
		options: {
			useAccelerateEndpoint: input?.options?.useAccelerateEndpoint,
			bucket: input?.options?.bucket,
			locationCredentialsProvider: input?.options?.locationCredentialsProvider,
			expectedBucketOwner: input?.options?.expectedBucketOwner,
			customEndpoint: input?.options?.customEndpoint,
		},
		// Type casting is necessary because `getPropertiesInternal` supports both Gen1 and Gen2 signatures, but here
		// given in input can only be Gen2 signature, the return can only ben Gen2 signature.
	}) as Promise<GetPropertiesOutput>;
}
