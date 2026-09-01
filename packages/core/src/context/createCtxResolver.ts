// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from './AmplifyContext';
import { getGlobalContext } from './globalContext';

/**
 * Creates a context resolver for class-based ("Pattern 7") providers that
 * accept an optional explicit {@link AmplifyContext} at construction time.
 *
 * The returned function resolves the context **fresh on every call**:
 * the explicitly-passed context (when one was given) always wins, otherwise
 * the *current* global context is looked up at call time.
 *
 * **Never capture `getGlobalContext()` in a constructor.** `configure()`
 * replaces the frozen global context object wholesale, so a snapshot taken at
 * construction goes stale after any reconfigure, and eager resolution throws
 * {@link NoAmplifyContextError} when the provider is instantiated before
 * `configure()` runs. Store only the explicitly-passed context and call the
 * resolver returned here once per operation.
 *
 * @example
 * ```ts
 * class MyProvider {
 *   private readonly resolveCtx: () => AmplifyContext;
 *   constructor(ctx?: AmplifyContext) {
 *     this.resolveCtx = createCtxResolver(ctx);
 *   }
 *   async doWork() {
 *     const ctx = this.resolveCtx(); // fresh per operation
 *   }
 * }
 * ```
 *
 * @param explicitCtx - The context explicitly passed by the caller, if any.
 * @returns A function resolving `explicitCtx ?? getGlobalContext()` per call.
 *   Throws {@link NoAmplifyContextError} when neither is available.
 *
 * @internal
 */
export function createCtxResolver(
	explicitCtx?: AmplifyContext,
): () => AmplifyContext {
	return () => explicitCtx ?? getGlobalContext();
}
