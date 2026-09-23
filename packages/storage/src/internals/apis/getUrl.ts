// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyContext,
	getGlobalContext,
	isAmplifyContext,
} from '@aws-amplify/core';

import { getUrl as getUrlInternal } from '../../providers/s3/apis/internal/getUrl';
import { GetUrlInput } from '../types/inputs';
import { GetUrlOutput } from '../types/outputs';

/**
 * @internal
 */
export function getUrl(
	ctx: AmplifyContext,
	input: GetUrlInput,
): Promise<GetUrlOutput>;
/**
 * @internal
 */
export function getUrl(input: GetUrlInput): Promise<GetUrlOutput>;
export function getUrl(
	ctxOrInput: AmplifyContext | GetUrlInput,
	maybeInput?: GetUrlInput,
): Promise<GetUrlOutput> {
	// Resolve the optional leading context. The global context is resolved at
	// CALL time (never cached) so single-arg callers follow live configuration.
	const [ctx, input]: [AmplifyContext, GetUrlInput] = isAmplifyContext(
		ctxOrInput,
	)
		? [ctxOrInput, maybeInput as GetUrlInput]
		: [getGlobalContext(), ctxOrInput];

	return getUrlInternal(ctx, {
		path: input.path,
		options: {
			useAccelerateEndpoint: input?.options?.useAccelerateEndpoint,
			bucket: input?.options?.bucket,
			validateObjectExistence: input?.options?.validateObjectExistence,
			expiresIn: input?.options?.expiresIn,
			contentDisposition: input?.options?.contentDisposition,
			contentType: input?.options?.contentType,
			expectedBucketOwner: input?.options?.expectedBucketOwner,

			// Advanced options
			locationCredentialsProvider: input?.options?.locationCredentialsProvider,
			customEndpoint: input?.options?.customEndpoint,
			method: input?.options?.method,
		},
		// Type casting is necessary because `getPropertiesInternal` supports both Gen1 and Gen2 signatures, but here
		// given in input can only be Gen2 signature, the return can only ben Gen2 signature.
	}) as Promise<GetUrlOutput>;
}
