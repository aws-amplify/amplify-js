// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '../../context/AmplifyContext';
import { resolveCtxArgs } from '../../context/resolveCtxArgs';
import { AuthSession, FetchAuthSessionOptions } from '../Auth/types';

/**
 * Fetch the auth session including the tokens and credentials if they are available. By default it
 * will automatically refresh expired auth tokens if a valid refresh token is present. You can force a refresh
 * of non-expired tokens with `{ forceRefresh: true }` input.
 *
 * @param options - Options configuring the fetch behavior.
 * @throws {@link AuthError} - Throws error when session information cannot be refreshed.
 * @returns Promise<AuthSession>
 */
export function fetchAuthSession(
	options?: FetchAuthSessionOptions,
): Promise<AuthSession>;
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
export function fetchAuthSession(...args: any[]): Promise<AuthSession> {
	// `resolveCtxArgs` handles the global-context fallback plus the
	// mis-ordered / undefined-context guards used across all category APIs.
	const [ctx, options] = resolveCtxArgs<[FetchAuthSessionOptions?]>(args);

	return ctx.fetchAuthSession(options);
}
