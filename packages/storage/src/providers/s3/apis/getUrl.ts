// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { resolveCtxArgs } from '@aws-amplify/core/internals/utils';

import {
	GetUrlInput,
	GetUrlOutput,
	GetUrlWithPathInput,
	GetUrlWithPathOutput,
} from '../types';

import { getUrl as getUrlInternal } from './internal/getUrl';

// --- Overloads without ctx ---

export function getUrl(
	input: GetUrlWithPathInput,
): Promise<GetUrlWithPathOutput>;
export function getUrl(input: GetUrlInput): Promise<GetUrlOutput>;

// --- Overloads with explicit ctx ---

export function getUrl(
	ctx: AmplifyContext,
	input: GetUrlWithPathInput,
): Promise<GetUrlWithPathOutput>;
export function getUrl(
	ctx: AmplifyContext,
	input: GetUrlInput,
): Promise<GetUrlOutput>;

// --- Implementation ---

export function getUrl(...args: any[]) {
	const [ctx, input] = resolveCtxArgs<GetUrlInput | GetUrlWithPathInput>(args);

	return getUrlInternal(ctx, input);
}
