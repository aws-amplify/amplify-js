// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import { AuthUser } from '../../types';

import { resolveSessionSwitcher } from './resolveSessionSwitcher';

/**
 * Lists all the users currently signed in for the configured user pool, in
 * roster order (the active user first), from a server context.
 *
 * Each user's identity is resolved from that user's STORED id token without
 * triggering a token refresh or emitting any Hub event. Any user whose stored
 * id token cannot be resolved is skipped, keeping the returned list
 * self-healing.
 *
 * @param contextSpec - The context spec used to get the Amplify server context.
 * @returns An array of AuthUser objects, one per resolvable session, ordered
 * with the active user first.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 * @throws {@link AuthError} - Thrown with name `TokenProviderNotFoundException`
 * when no token provider is configured on the resolved context.
 * @remarks Unlike the client variant, AuthUser objects returned in the server
 * context do not include signInDetails.
 */
export const listCurrentUsers = async (
	contextSpec: AmplifyServer.ContextSpec,
): Promise<AuthUser[]> => {
	const { amplify } = getAmplifyServerContext(contextSpec);
	const switcher = resolveSessionSwitcher(amplify);

	// Roster is ordered with the active user first; preserve that order.
	const roster = await switcher.listSessionUsernames();

	// Resolve each user in parallel while preserving roster order; users that
	// fail to resolve become undefined and are filtered out below (self-healing).
	const resolvedUsers = await Promise.all(
		roster.map(async rosterUsername => {
			const idToken = await switcher.getStoredIdToken(rosterUsername);

			const { 'cognito:username': cognitoUsername, sub } =
				idToken?.payload ?? {};

			// Drop users whose stored id token is missing or lacks a `sub`
			// claim: without `sub` the AuthUser userId contract (always a
			// string) cannot be satisfied, so treat them as unresolvable.
			if (!idToken || !sub) {
				return undefined;
			}

			const authUser: AuthUser = {
				username: (cognitoUsername as string) ?? rosterUsername,
				userId: sub as string,
			};

			return authUser;
		}),
	);

	return resolvedUsers.filter((user): user is AuthUser => user !== undefined);
};
