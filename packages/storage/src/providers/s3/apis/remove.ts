// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { resolveCtxArgs } from '@aws-amplify/core/internals/utils';

import {
	RemoveInput,
	RemoveOperation,
	RemoveOutput,
	RemoveWithPathInput,
	RemoveWithPathOutput,
} from '../types';

import { remove as removeInternal } from './internal/remove';

// --- Overloads without ctx ---

export function remove(
	input: RemoveWithPathInput,
): RemoveOperation<RemoveWithPathOutput>;
export function remove(input: RemoveInput): RemoveOperation<RemoveOutput>;

// --- Overloads with explicit ctx ---

export function remove(
	ctx: AmplifyContext,
	input: RemoveWithPathInput,
): RemoveOperation<RemoveWithPathOutput>;
export function remove(
	ctx: AmplifyContext,
	input: RemoveInput,
): RemoveOperation<RemoveOutput>;

// --- Implementation ---

export function remove(...args: any[]) {
	const [ctx, input] = resolveCtxArgs<RemoveInput | RemoveWithPathInput>(args);

	if ('key' in input) {
		return removeInternal(ctx, input);
	} else {
		return removeInternal(ctx, input);
	}
}
