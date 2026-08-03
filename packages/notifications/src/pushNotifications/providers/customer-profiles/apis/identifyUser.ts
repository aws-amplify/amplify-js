// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { resolveCtxArgs } from '@aws-amplify/core/internals/utils';

import { identifyUserInternal } from '../utils/identifyUserInternal';
import { IdentifyUserInput } from '../types';

/**
 * Sends profile information about a user to Amazon Connect Customer Profiles.
 * This associates the caller's `userProfile` with their Customer Profile. The
 * backend derives the `principalId` server-side from the SigV4 signer identity,
 * so no `userId` is sent by the client.
 *
 * This API is profile-only on all platforms and performs no device work — to
 * register/de-register a push device use `registerDevice` / `removeDevice`
 * (React Native only).
 *
 * @param {IdentifyUserInput} input The input object used to construct the request
 *  sent to the Amazon Connect Customer Profiles endpoint.
 * @throws service - Thrown when the Customer Profiles endpoint responds with a
 *  non-2xx status or the request fails to complete.
 * @throws validation - Thrown when the provided parameters or library
 *  configuration is incorrect.
 * @returns A promise that will resolve when the operation is complete.
 * @example
 * ```ts
 * await identifyUser({
 *     userProfile: {
 *         email: 'userEmail@example.com',
 *         name: 'Jane Doe',
 *         location: { city: 'Seattle', country: 'US' },
 *     },
 * });
 * ```
 */
export async function identifyUser(input: IdentifyUserInput): Promise<void>;
/**
 * @param ctx - The {@link AmplifyContext} to use for config and credentials.
 */
export async function identifyUser(
	ctx: AmplifyContext,
	input: IdentifyUserInput,
): Promise<void>;
export async function identifyUser(...args: any[]): Promise<void> {
	const [ctx, input] = resolveCtxArgs<[IdentifyUserInput]>(args);
	await identifyUserInternal(ctx, { userProfile: input.userProfile });
}
