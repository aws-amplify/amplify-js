// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NoAmplifyContextError } from '../errors/NoAmplifyContextError';

import { AmplifyContext } from './AmplifyContext';
import { isAmplifyContext } from './contextBrand';
import { getGlobalContext } from './globalContext';

/**
 * Resolves the optional leading `AmplifyContext` argument from a function's
 * arguments array. Used by category functions that accept an optional context
 * as their first positional parameter.
 *
 * @returns A tuple of `[AmplifyContext, ...T]` where `T` is the remaining args.
 *
 * @example
 * ```ts
 * export function signIn(...args: any[]) {
 *   const [ctx, input] = resolveCtxArgs<[SignInInput]>(args);
 *   // ctx is guaranteed to be a valid AmplifyContext
 * }
 * ```
 *
 * @internal
 */
export function resolveCtxArgs<T extends unknown[]>(
	args: unknown[],
): [AmplifyContext, ...T] {
	if (isAmplifyContext(args[0])) {
		return [args[0], ...args.slice(1)] as [AmplifyContext, ...T];
	}

	// Guard against mis-ordered calls (e.g. `send(input, ctx)` from untyped JS):
	// a context anywhere but the first position would otherwise be silently
	// treated as a regular argument while the call falls back to the global context.
	// Checked before the undefined-first-arg guard so the more specific message
	// wins whenever a context actually exists somewhere in `args`.
	if (args.some(isAmplifyContext)) {
		throw new Error(
			'AmplifyContext must be passed as the first argument. ' +
				'Found an AmplifyContext in a later position — check the argument order.',
		);
	}

	if (args.length > 1 && args[0] === undefined) {
		// Unconfigured/undefined leading context — throw the typed error (stable
		// name/code) so categories can catch it uniformly. The fallback path
		// below also throws NoAmplifyContextError via getGlobalContext().
		throw new NoAmplifyContextError(
			'Undefined AmplifyContext passed. Call configure() first or omit the parameter.',
		);
	}

	return [getGlobalContext(), ...args] as [AmplifyContext, ...T];
}
