// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';

import { AuthUser } from '../types/models';
import { cognitoUserPoolsTokenProvider } from '../tokenProvider';

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
export async function listCurrentUsers(): Promise<AuthUser[]> {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { userPoolClientId } = authConfig;

	const { authTokenStore } = cognitoUserPoolsTokenProvider;
	const keyValueStorage = authTokenStore.getKeyValueStorage();

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

			const signInDetailsKey = `CognitoIdentityServiceProvider.${userPoolClientId}.${rosterUsername}.signInDetails`;
			const signInDetailsString =
				await keyValueStorage.getItem(signInDetailsKey);
			if (signInDetailsString) {
				authUser.signInDetails = JSON.parse(signInDetailsString);
			}

			return authUser;
		}),
	);

	return resolvedUsers.filter((user): user is AuthUser => user !== undefined);
}
