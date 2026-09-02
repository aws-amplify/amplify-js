// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '../../context/AmplifyContext';
import { resolveCtxArgs } from '../../context/resolveCtxArgs';

import { isUnconfiguredNoCtxCall } from './isUnconfiguredNoCtxCall';

/**
 * Clears the cached auth credentials of the global {@link AmplifyContext}.
 * Before `Amplify.configure()` has run this resolves harmlessly, matching the
 * pre-context behavior.
 */
export function clearCredentials(): Promise<void>;
/**
 * Clears the cached auth credentials of the given {@link AmplifyContext}
 * instead of the global one.
 *
 * @param ctx - The explicit {@link AmplifyContext} whose credentials are cleared.
 */
export function clearCredentials(ctx: AmplifyContext): Promise<void>;
export function clearCredentials(...args: any[]): Promise<void> {
	// Back-compat: before the context migration, `clearCredentials()` on an
	// unconfigured Amplify resolved harmlessly (the unconfigured `AuthClass`
	// optional-chains its missing credentials provider) rather than throwing.
	// Preserve that for the no-context form; the typed guards in
	// `resolveCtxArgs` still apply to explicit / mis-ordered context arguments.
	if (isUnconfiguredNoCtxCall(args)) {
		return Promise.resolve();
	}

	// `resolveCtxArgs` handles the global-context fallback plus the
	// mis-ordered / undefined-context guards used across all category APIs.
	const [ctx] = resolveCtxArgs<[]>(args);

	return ctx.clearCredentials();
}
