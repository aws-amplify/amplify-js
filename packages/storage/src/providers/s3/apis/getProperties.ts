// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { resolveCtxArgs } from '@aws-amplify/core/internals/utils';

import {
	GetPropertiesInput,
	GetPropertiesOutput,
	GetPropertiesWithPathInput,
	GetPropertiesWithPathOutput,
} from '../types';

import { getProperties as getPropertiesInternal } from './internal/getProperties';

// --- Overloads without ctx ---

export function getProperties(
	input: GetPropertiesWithPathInput,
): Promise<GetPropertiesWithPathOutput>;
export function getProperties(
	input: GetPropertiesInput,
): Promise<GetPropertiesOutput>;

// --- Overloads with explicit ctx ---

export function getProperties(
	ctx: AmplifyContext,
	input: GetPropertiesWithPathInput,
): Promise<GetPropertiesWithPathOutput>;
export function getProperties(
	ctx: AmplifyContext,
	input: GetPropertiesInput,
): Promise<GetPropertiesOutput>;

// --- Implementation ---

export function getProperties(...args: any[]) {
	const [ctx, input] = resolveCtxArgs<
		GetPropertiesInput | GetPropertiesWithPathInput
	>(args);

	return getPropertiesInternal(ctx, input);
}
