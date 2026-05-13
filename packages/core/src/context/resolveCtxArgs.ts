// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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
	if (args.length > 1 && args[0] === undefined) {
		throw new Error(
			'Undefined AmplifyContext passed. Call configure() first or omit the parameter.',
		);
	}

	if (isAmplifyContext(args[0])) {
		return [args[0], ...args.slice(1)] as [AmplifyContext, ...T];
	}

	return [getGlobalContext(), ...args] as [AmplifyContext, ...T];
}
