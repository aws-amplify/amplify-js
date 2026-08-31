// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext, getGlobalContext } from '@aws-amplify/core';

export { createKeyValueStorageFromCookieStorageAdapter } from './storageFactories';
export {
	createAWSCredentialsAndIdentityIdProvider,
	createUserPoolsTokenProvider,
} from './authProvidersFactories/cognito';
export {
	/** @deprecated This type is deprecated and will be removed in future versions. */
	LegacyConfig,
	/** @deprecated This type is deprecated and will be removed in future versions. */
	AmplifyOutputs,
} from '@aws-amplify/core/internals/utils';
export { CookieStorage } from '@aws-amplify/core/internals/adapter-core';
export {
	generateState,
	getRedirectUrl,
	generateCodeVerifier,
	validateState,
	createKeysForAuthStorage,
	AUTH_KEY_PREFIX,
} from '@aws-amplify/auth/cognito';
export { DEFAULT_AUTH_TOKEN_COOKIES_MAX_AGE } from './constants';

// Backwards-compat: `AmplifyServer.ContextSpec` and the standalone
// `ContextSpec` alias both resolve to the singleton-free `AmplifyContext`.
export { type AmplifyContext as ContextSpec } from '@aws-amplify/core';
export { AmplifyServer } from './AmplifyServer';
export { AmplifyServerContextError } from '@aws-amplify/core/internals/adapter-core';

/**
 * Runs an operation with an {@link AmplifyContext}.
 *
 * @deprecated The server-context registry has been removed in favor of the
 * branded {@link AmplifyContext} model, and this shim's semantics have changed
 * in ways untyped-JS callers will not catch at compile time. Read before using:
 *
 * - **Semantics are inverted.** The old API built an *isolated, per-call*
 *   server context for the duration of `operation`. This shim instead resolves
 *   the process-wide **global** context (the one set by `Amplify.configure()`)
 *   and passes it to `operation`. It no longer creates or scopes anything.
 * - **The request-scoped `{ nextServerContext: reqRes }` shape is GONE.** The
 *   authenticated form that previously drove per-request auth (cookies/headers
 *   from the incoming request/response pair) is no longer accepted. Untyped-JS
 *   callers that relied on it will silently fall through to the single global
 *   context and **share one context across every request** — a correctness and
 *   security hazard in SSR / multi-tenant deployments.
 * - **Use the request-scoped path instead.** For true per-request isolation use
 *   `createRunWithAmplifyServerContext` from `@aws-amplify/adapter-nextjs`, or
 *   build a context explicitly with `createAmplifyContext()` and pass it to
 *   category APIs.
 *
 * This shim is retained only for backwards compatibility and simply resolves
 * the current global context before invoking `operation`.
 */
export async function runWithAmplifyServerContext<T>(input: {
	nextServerContext: null;
	operation(contextSpec: AmplifyContext): T | Promise<T>;
}): Promise<T>;
/**
 * @deprecated See the overload above. Prefer
 * `@aws-amplify/adapter-nextjs`'s `createRunWithAmplifyServerContext` for
 * per-request isolation, or `createAmplifyContext()` + direct API calls. This
 * shim resolves the process-wide global context, not an isolated per-call one.
 */
export async function runWithAmplifyServerContext<T>(input: {
	operation(contextSpec: AmplifyContext): T | Promise<T>;
}): Promise<T>;
export async function runWithAmplifyServerContext<T>(input: {
	nextServerContext?: null;
	operation(contextSpec: AmplifyContext): T | Promise<T>;
}): Promise<T> {
	const ctx = getGlobalContext();

	return input.operation(ctx);
}
