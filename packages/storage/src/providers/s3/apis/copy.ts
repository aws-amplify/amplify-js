// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { resolveCtxArgs } from '@aws-amplify/core/internals/utils';

import {
	CopyInput,
	CopyOutput,
	CopyWithPathInput,
	CopyWithPathOutput,
} from '../types';

import { copy as copyInternal } from './internal/copy';

// --- Overloads without ctx ---

export function copy(input: CopyWithPathInput): Promise<CopyWithPathOutput>;
export function copy(input: CopyInput): Promise<CopyOutput>;

// --- Overloads with explicit ctx ---

export function copy(
	ctx: AmplifyContext,
	input: CopyWithPathInput,
): Promise<CopyWithPathOutput>;
export function copy(
	ctx: AmplifyContext,
	input: CopyInput,
): Promise<CopyOutput>;

// --- Implementation ---

export function copy(...args: any[]) {
	const [ctx, input] = resolveCtxArgs<CopyInput | CopyWithPathInput>(args);

	return copyInternal(ctx, input);
}
