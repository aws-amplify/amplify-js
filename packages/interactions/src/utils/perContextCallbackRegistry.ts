// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyContext } from '@aws-amplify/core';

export interface PerContextCallbackRegistry<TCallback> {
	/**
	 * Register (or replace) the callback for `name` under the given context.
	 */
	set(ctx: AmplifyContext, name: string, callback: TCallback): void;

	/**
	 * Look up the callback for `name` registered against this exact context.
	 * Returns `undefined` when nothing was registered for that (ctx, name)
	 * pair — callbacks registered against a different context are never
	 * returned (context isolation).
	 */
	get(ctx: AmplifyContext, name: string): TCallback | undefined;
}

/**
 * Creates a per-context callback registry. Keyed on the *resolved*
 * `AmplifyContext` object identity so a callback registered against one
 * context never fires for another (context isolation) — previously this was
 * a single process-global map keyed only by bot name, which leaked callbacks
 * across independent contexts.
 *
 * NOTE (re-configure semantics): `Amplify.configure()` publishes a NEW frozen
 * global context object on every call. A callback registered against the
 * global context before a re-configure is therefore keyed on the OLD context
 * object and will NOT be found after re-configure (the new global context is
 * a different object). Callers relying on the global context must re-register
 * their callback after reconfiguring; callers passing an explicit context keep
 * their callbacks for that context's lifetime. Using a `WeakMap` lets the
 * per-context records be garbage-collected once a context is unreferenced.
 */
export function createPerContextCallbackRegistry<
	TCallback,
>(): PerContextCallbackRegistry<TCallback> {
	const callbacksByCtx = new WeakMap<
		AmplifyContext,
		Record<string, TCallback>
	>();

	return {
		set(ctx, name, callback) {
			const existing = callbacksByCtx.get(ctx);
			if (existing) {
				existing[name] = callback;
			} else {
				callbacksByCtx.set(ctx, { [name]: callback });
			}
		},
		get(ctx, name) {
			return callbacksByCtx.get(ctx)?.[name];
		},
	};
}
