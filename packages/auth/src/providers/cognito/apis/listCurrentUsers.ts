// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import {
	assertTokenProviderConfig,
	resolveCtxArgs,
} from '@aws-amplify/core/internals/utils';

import { AuthUser } from '../types/models';
import { cognitoUserPoolsTokenProvider } from '../tokenProvider';

export async function listCurrentUsers(
	ctx: AmplifyContext,
): Promise<AuthUser[]>;

/**
 * Lists all the users currently signed in for the configured user pool, in
 * roster order (the active user first).
 *
 * Each user's identity is resolved from that user's STORED id token without
 * triggering a token refresh. Any user whose stored tokens cannot be resolved
 * is skipped, keeping the returned list self-healing.
 *
 * @returns An array of AuthUser objects, one per resolvable session, ordered
 * with the active user first.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function listCurrentUsers(): Promise<AuthUser[]>;
export async function listCurrentUsers(...args: any[]): Promise<AuthUser[]> {
	const [ctx] = resolveCtxArgs<[]>(args);
	const authConfig = ctx.resourcesConfig.Auth?.Cognito;
	assertTokenProviderConfig(authConfig);

	const { authTokenStore } = cognitoUserPoolsTokenProvider;

	// Roster is ordered with the active user first; preserve that order.
	const roster = await authTokenStore.getAuthUserList();

	// Resolve each user in parallel while preserving roster order; users that
	// fail to resolve become undefined and are filtered out below (self-healing).
	const resolvedUsers = await Promise.all(
		roster.map(async rosterUsername => {
			const idToken = await authTokenStore.getStoredIdToken(rosterUsername);

			if (!idToken) {
				return undefined;
			}

			const { 'cognito:username': cognitoUsername, sub } =
				idToken.payload ?? {};

			// Drop users whose stored id token lacks a `sub` claim: without
			// `sub` the AuthUser userId contract (always a string) cannot be
			// satisfied, so treat them as unresolvable.
			if (!sub) {
				return undefined;
			}

			const authUser: AuthUser = {
				username: (cognitoUsername as string) ?? rosterUsername,
				userId: sub as string,
			};

			// Keyed via the shared store helper (getAuthKeys) rather than a
			// hand-built key template, avoiding drift with the token namespace.
			const signInDetails =
				await authTokenStore.getStoredSignInDetails(rosterUsername);
			if (signInDetails) {
				authUser.signInDetails = signInDetails;
			}

			return authUser;
		}),
	);

	return resolvedUsers.filter((user): user is AuthUser => user !== undefined);
}
