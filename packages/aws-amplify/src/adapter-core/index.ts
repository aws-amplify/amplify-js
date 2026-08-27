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
 * branded {@link AmplifyContext} model. Prefer building a context explicitly
 * with `createAmplifyContext()` (for per-request isolation) or calling category
 * APIs directly against the global context. This shim is retained for
 * backwards compatibility and simply resolves the current global context
 * before invoking `operation`.
 */
export async function runWithAmplifyServerContext<T>(input: {
	nextServerContext: null;
	operation(contextSpec: AmplifyContext): T | Promise<T>;
}): Promise<T>;
/**
 * @deprecated Use `createAmplifyContext()` + direct API calls instead.
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
