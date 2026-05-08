// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { resolveCtxArgs } from '@aws-amplify/core/internals/utils';

import { UpdateUserAttributeInput, UpdateUserAttributeOutput } from '../types';
import { UpdateUserAttributesException } from '../types/errors';

import { updateUserAttributes } from './updateUserAttributes';

/**
 * Updates user's attribute while authenticated.
 *
 * @param input - The UpdateUserAttributeInput object
 * @returns UpdateUserAttributeOutput
 * @throws - {@link UpdateUserAttributesException}
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function updateUserAttribute(
	input: UpdateUserAttributeInput,
): Promise<UpdateUserAttributeOutput>;
export async function updateUserAttribute(
	ctx: AmplifyContext,
	input: UpdateUserAttributeInput,
): Promise<UpdateUserAttributeOutput>;
export async function updateUserAttribute(
	...args: any[]
): Promise<UpdateUserAttributeOutput> {
	const [ctx, input] = resolveCtxArgs<UpdateUserAttributeInput>(args);
	const {
		userAttribute: { attributeKey, value },
		options,
	} = input;
	const output = await updateUserAttributes(ctx, {
		userAttributes: { [attributeKey]: value },
		options,
	});

	return Object.values(output)[0];
}
