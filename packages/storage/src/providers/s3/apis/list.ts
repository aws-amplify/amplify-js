// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyContext } from '@aws-amplify/core';
import { resolveCtxArgs } from '@aws-amplify/core/internals/utils';

import {
	ListAllInput,
	ListAllOutput,
	ListAllWithPathInput,
	ListAllWithPathOutput,
	ListPaginateInput,
	ListPaginateOutput,
	ListPaginateWithPathInput,
	ListPaginateWithPathOutput,
} from '../types';

import { list as listInternal } from './internal/list';

// --- Overloads without ctx (uses global context) ---

export function list(
	input: ListPaginateWithPathInput,
): Promise<ListPaginateWithPathOutput>;
export function list(
	input: ListAllWithPathInput,
): Promise<ListAllWithPathOutput>;
export function list(input?: ListPaginateInput): Promise<ListPaginateOutput>;
export function list(input?: ListAllInput): Promise<ListAllOutput>;

// --- Overloads with explicit ctx ---

export function list(
	ctx: AmplifyContext,
	input: ListPaginateWithPathInput,
): Promise<ListPaginateWithPathOutput>;
export function list(
	ctx: AmplifyContext,
	input: ListAllWithPathInput,
): Promise<ListAllWithPathOutput>;
export function list(
	ctx: AmplifyContext,
	input?: ListPaginateInput,
): Promise<ListPaginateOutput>;
export function list(
	ctx: AmplifyContext,
	input?: ListAllInput,
): Promise<ListAllOutput>;

// --- Implementation ---

export function list(...args: any[]) {
	const [ctx, input] = resolveCtxArgs<
		| ListAllInput
		| ListPaginateInput
		| ListAllWithPathInput
		| ListPaginateWithPathInput
		| undefined
	>(args);

	return listInternal(ctx, input ?? {});
}
