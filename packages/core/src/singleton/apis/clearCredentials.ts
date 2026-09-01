// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '../../context/AmplifyContext';
import { resolveCtxArgs } from '../../context/resolveCtxArgs';

/**
 * Clears the cached auth credentials of the global {@link AmplifyContext}.
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
	// `resolveCtxArgs` handles the global-context fallback plus the
	// mis-ordered / undefined-context guards used across all category APIs.
	const [ctx] = resolveCtxArgs<[]>(args);

	return ctx.clearCredentials();
}
