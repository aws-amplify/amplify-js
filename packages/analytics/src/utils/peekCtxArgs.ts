// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext, isAmplifyContext } from '@aws-amplify/core';

/**
 * Result of peeking a public-API arguments array for an optional leading
 * {@link AmplifyContext}.
 */
export interface PeekedCtxArgs<TInput> {
	/** The explicit context, when one was passed as the first argument. */
	ctx?: AmplifyContext;
	/** The public-API input (first argument after the optional context). */
	input: TInput;
}

/**
 * Non-destructively inspects a public-API arguments array and separates the
 * optional leading {@link AmplifyContext} from the API input.
 *
 * Unlike core's `resolveCtxArgs`, this helper deliberately does NOT fall back
 * to the global context — `ctx` stays `undefined` when no explicit context was
 * supplied. Callers (e.g. `configureAutoTrack`) that only need the context at
 * emit time use this so the global context is resolved lazily: resolving it
 * eagerly would (a) throw when trackers are configured before
 * `Amplify.configure()` and (b) pin auto-tracked events to the configuration
 * snapshot captured at setup time after a later `configure()` call.
 *
 * @param args The raw arguments array of an overloaded public API.
 *
 * @returns `{ ctx?, input }` — `ctx` is set only when the first argument is a
 * branded `AmplifyContext`; `input` is the argument that follows it (or the
 * first argument when no context was passed).
 *
 * @internal
 */
export function peekCtxArgs<TInput>(args: unknown[]): PeekedCtxArgs<TInput> {
	return isAmplifyContext(args[0])
		? { ctx: args[0], input: args[1] as TInput }
		: { ctx: undefined, input: args[0] as TInput };
}
