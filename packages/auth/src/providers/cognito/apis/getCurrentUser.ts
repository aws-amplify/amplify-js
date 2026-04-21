// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { resolveCtxArgs } from '@aws-amplify/core/internals/utils';

import { GetCurrentUserOutput } from '../types';
import { InitiateAuthException } from '../types/errors';

import { getCurrentUser as getCurrentUserInternal } from './internal/getCurrentUser';

/**
 * Gets the current user from the idToken.
 *
 * @param input -  The GetCurrentUserInput object.
 * @returns GetCurrentUserOutput
 * @throws - {@link InitiateAuthException} - Thrown when the service fails to refresh the tokens.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function getCurrentUser(): Promise<GetCurrentUserOutput>;
export async function getCurrentUser(
	ctx: AmplifyContext,
): Promise<GetCurrentUserOutput>;
export async function getCurrentUser(
	...args: any[]
): Promise<GetCurrentUserOutput> {
	const [ctx] = resolveCtxArgs<undefined>(args);

	return getCurrentUserInternal(ctx);
}
