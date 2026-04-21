// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext, defaultStorage } from '@aws-amplify/core';
import { resolveCtxArgs } from '@aws-amplify/core/internals/utils';

import {
	UploadDataInput,
	UploadDataOutput,
	UploadDataWithPathInput,
	UploadDataWithPathOutput,
} from '../types';

import { uploadData as uploadDataInternal } from './internal/uploadData';

// --- Overloads without ctx ---

export function uploadData(
	input: UploadDataWithPathInput,
): UploadDataWithPathOutput;
export function uploadData(input: UploadDataInput): UploadDataOutput;

// --- Overloads with explicit ctx ---

export function uploadData(
	ctx: AmplifyContext,
	input: UploadDataWithPathInput,
): UploadDataWithPathOutput;
export function uploadData(
	ctx: AmplifyContext,
	input: UploadDataInput,
): UploadDataOutput;

// --- Implementation ---

export function uploadData(...args: any[]) {
	const [ctx, input] = resolveCtxArgs<
		UploadDataInput | UploadDataWithPathInput
	>(args);

	return uploadDataInternal(ctx, {
		...input,
		options: {
			...input?.options,
			// This option enables caching in-progress multipart uploads.
			// It's ONLY needed for client-side API.
			resumableUploadsCache: defaultStorage,
		},
	});
}
