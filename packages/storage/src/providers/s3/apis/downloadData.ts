// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { resolveCtxArgs } from '@aws-amplify/core/internals/utils';

import {
	DownloadDataInput,
	DownloadDataOutput,
	DownloadDataWithPathInput,
	DownloadDataWithPathOutput,
} from '../types';

import { downloadData as downloadDataInternal } from './internal/downloadData';

// --- Overloads without ctx ---

export function downloadData(
	input: DownloadDataWithPathInput,
): DownloadDataWithPathOutput;
export function downloadData(input: DownloadDataInput): DownloadDataOutput;

// --- Overloads with explicit ctx ---

export function downloadData(
	ctx: AmplifyContext,
	input: DownloadDataWithPathInput,
): DownloadDataWithPathOutput;
export function downloadData(
	ctx: AmplifyContext,
	input: DownloadDataInput,
): DownloadDataOutput;

// --- Implementation ---

export function downloadData(...args: any[]) {
	const [ctx, input] = resolveCtxArgs<
		DownloadDataInput | DownloadDataWithPathInput
	>(args);

	return downloadDataInternal(ctx, input);
}
