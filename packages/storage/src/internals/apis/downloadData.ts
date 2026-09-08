// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyContext,
	getGlobalContext,
	isAmplifyContext,
} from '@aws-amplify/core';

import { downloadData as downloadDataInternal } from '../../providers/s3/apis/internal/downloadData';
import { DownloadDataInput } from '../types/inputs';
import { DownloadDataOutput } from '../types/outputs';

/**
 * @internal
 */
export function downloadData(
	ctx: AmplifyContext,
	input: DownloadDataInput,
): DownloadDataOutput;
/**
 * @internal
 */
export function downloadData(input: DownloadDataInput): DownloadDataOutput;
export function downloadData(
	ctxOrInput: AmplifyContext | DownloadDataInput,
	maybeInput?: DownloadDataInput,
): DownloadDataOutput {
	// Resolve the optional leading context. The global context is resolved at
	// CALL time (never cached) so single-arg callers follow live configuration.
	const [ctx, input]: [AmplifyContext, DownloadDataInput] = isAmplifyContext(
		ctxOrInput,
	)
		? [ctxOrInput, maybeInput as DownloadDataInput]
		: [getGlobalContext(), ctxOrInput];

	return downloadDataInternal(ctx, {
		path: input.path,
		options: {
			useAccelerateEndpoint: input?.options?.useAccelerateEndpoint,
			bucket: input?.options?.bucket,
			locationCredentialsProvider: input?.options?.locationCredentialsProvider,
			bytesRange: input?.options?.bytesRange,
			onProgress: input?.options?.onProgress,
			expectedBucketOwner: input?.options?.expectedBucketOwner,
			customEndpoint: input?.options?.customEndpoint,
		},
		// Type casting is necessary because `downloadDataInternal` supports both Gen1 and Gen2 signatures, but here
		// given in input can only be Gen2 signature, the return can only ben Gen2 signature.
	}) as DownloadDataOutput;
}
