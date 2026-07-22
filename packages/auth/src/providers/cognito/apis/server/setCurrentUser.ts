// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import { resolveSessionSwitcher } from './resolveSessionSwitcher';

/**
 * Switches the active user to a different signed-in user within a server
 * context, without requiring re-authentication.
 *
 * The target user must already be part of the current session roster (i.e. have
 * signed in previously and not signed out). The active user pointer is moved to
 * the front of the roster and the previous active user's identity-pool
 * credentials are cleared (context-scoped) so subsequent credential requests
 * resolve against the newly active user.
 *
 * Unlike the client API, this does NOT emit a `switchActiveUser` Hub event.
 *
 * @param contextSpec - The context spec used to get the Amplify server context.
 * @param username - The username of the signed-in user to switch to.
 * @returns void
 * @throws {@link AuthError} - Thrown with name `UserNotSignedInException` when
 * the given username has no signed-in session in the roster.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 * @throws {@link AuthError} - Thrown with name `TokenProviderNotFoundException`
 * when no token provider is configured on the resolved context.
 */
export const setCurrentUser = async (
	contextSpec: AmplifyServer.ContextSpec,
	username: string,
): Promise<void> => {
	const { amplify } = getAmplifyServerContext(contextSpec);
	const switcher = resolveSessionSwitcher(amplify);

	// Membership-checked reorder; throws (UserNotSignedInException) if absent.
	// Never adds a non-signed-in user and never deletes tokens.
	await switcher.setActiveSession(username);

	// Bust the previous active user's identity-pool credentials so subsequent
	// credential requests resolve against the newly active user. Uses the
	// context-scoped clearCredentials, NOT the global import.
	await amplify.Auth.clearCredentials();
};
