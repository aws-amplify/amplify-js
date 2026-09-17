// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext, TokenProvider } from '@aws-amplify/core';

import { AuthError } from '../../../../errors/AuthError';
import { AuthSessionSwitcher } from '../../tokenProvider';

/**
 * A token provider that additionally exposes a session switcher. This mirrors
 * the shape surfaced by the Cognito server token provider without importing it
 * (keeping `auth` free of a dependency on `aws-amplify`).
 */
type SessionSwitcherProvider = TokenProvider & {
	getSessionSwitcher(): AuthSessionSwitcher;
};

const hasSessionSwitcher = (
	provider: TokenProvider,
): provider is SessionSwitcherProvider =>
	'getSessionSwitcher' in provider &&
	typeof (provider as SessionSwitcherProvider).getSessionSwitcher ===
		'function';

/**
 * Resolves the non-destructive {@link AuthSessionSwitcher} from the token
 * provider configured on the given (server) Amplify context.
 *
 * Post Phase-C the server `AmplifyContext` is a narrow, branded object that no
 * longer exposes a bare `Amplify` class. The per-request Cognito token provider
 * is instead injected on `libraryOptions.Auth.tokenProvider` (see the
 * `aws-amplify` server-context bridge / `createAmplifyContext`), which is a
 * public, per-request-isolated surface. We read the switcher from there.
 *
 * @param ctx - The per-request Amplify context from the server context.
 * @returns The session switcher surfaced by the per-request token provider.
 * @throws {@link AuthError} - With name `TokenProviderNotFoundException` when no
 * session-switching token provider is configured on the context.
 */
export const resolveSessionSwitcher = (
	ctx: AmplifyContext,
): AuthSessionSwitcher => {
	const tokenProvider = ctx.libraryOptions.Auth?.tokenProvider;

	if (!tokenProvider || !hasSessionSwitcher(tokenProvider)) {
		throw new AuthError({
			name: 'TokenProviderNotFoundException',
			message:
				'The configured token provider does not support multi-session switching.',
			recoverySuggestion:
				'Ensure the Amplify server context is created with the Cognito user pools token provider.',
		});
	}

	return tokenProvider.getSessionSwitcher();
};
