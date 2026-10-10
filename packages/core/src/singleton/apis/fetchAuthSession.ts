// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '../../context/AmplifyContext';
import { resolveCtxArgs } from '../../context/resolveCtxArgs';
import { AuthSession, FetchAuthSessionOptions } from '../Auth/types';

import { isUnconfiguredNoCtxCall } from './isUnconfiguredNoCtxCall';
/**
 * Fetch the auth session of the given {@link AmplifyContext} — e.g. the
 * per-request context handed to an SSR `runWithAmplifyServerContext`
 * operation — instead of the global context. This restores the pre-context
 * v6 SSR calling pattern `fetchAuthSession(contextSpec)` (the deprecated
 * `ContextSpec` type is an alias of `AmplifyContext`, so existing SSR code
 * compiles unchanged).
 *
 * @param ctx - The explicit {@link AmplifyContext} whose auth providers are used.
 * @param options - Options configuring the fetch behavior.
 * @throws {@link AuthError} - Throws error when session information cannot be refreshed.
 * @returns Promise<AuthSession>
 */
export function fetchAuthSession(
	ctx: AmplifyContext,
	options?: FetchAuthSessionOptions,
): Promise<AuthSession>;

/**
 * Fetch the auth session including the tokens and credentials if they are available. By default it
 * will automatically refresh expired auth tokens if a valid refresh token is present. You can force a refresh
 * of non-expired tokens with `{ forceRefresh: true }` input.
 *
 * @param options - Options configuring the fetch behavior.
 * @throws {@link AuthError} - Throws error when session information cannot be refreshed.
 * @returns Promise<AuthSession> — before `Amplify.configure()` has run this
 * resolves with an empty session (all fields `undefined`), matching the
 * pre-context behavior.
 */
export function fetchAuthSession(
	options?: FetchAuthSessionOptions,
): Promise<AuthSession>;
export function fetchAuthSession(...args: any[]): Promise<AuthSession> {
	// Back-compat: before the context migration, `fetchAuthSession()` on an
	// unconfigured Amplify resolved with an empty session (the unconfigured
	// `AuthClass` optional-chains its missing providers) rather than throwing.
	// Preserve that for the no-context form; the typed guards in
	// `resolveCtxArgs` still apply to explicit / mis-ordered context arguments.
	if (isUnconfiguredNoCtxCall(args)) {
		return Promise.resolve({
			tokens: undefined,
			credentials: undefined,
			identityId: undefined,
			userSub: undefined,
		});
	}

	// `resolveCtxArgs` handles the global-context fallback plus the
	// mis-ordered / undefined-context guards used across all category APIs.
	const [ctx, options] = resolveCtxArgs<[FetchAuthSessionOptions?]>(args);

	return ctx.fetchAuthSession(options);
}
