// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Maps a per-context token provider object to its write-capable orchestrator.
 *
 * The public `TokenProvider` contract is read-only (`getTokens` only), so the
 * write side of a per-context provider cannot be hung off the provider itself
 * without expanding the public surface. This registry keeps that association
 * Amplify-owned and out of any public type.
 *
 * Weak keys so entries are GC'd with the context/provider. Values are kept
 * opaque (`unknown`) so core carries no dependency on auth's orchestrator type;
 * the reader supplies the concrete type at the call site.
 *
 * @internal
 */
const contextTokenOrchestrators = new WeakMap<object, unknown>();

/**
 * Associates a per-context token provider with its write-capable orchestrator.
 *
 * @internal
 */
export const registerContextTokenOrchestrator = (
	provider: object,
	orchestrator: object,
): void => {
	contextTokenOrchestrators.set(provider, orchestrator);
};

/**
 * Returns the orchestrator registered for the given token provider, or
 * `undefined` when the provider is absent or was never registered (the global
 * `Amplify.configure()` path).
 *
 * @internal
 */
export const getContextTokenOrchestrator = <T = unknown>(
	provider?: object,
): T | undefined =>
	provider
		? (contextTokenOrchestrators.get(provider) as T | undefined)
		: undefined;
