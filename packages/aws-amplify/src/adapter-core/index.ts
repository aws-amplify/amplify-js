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

// Backwards-compat: AmplifyServer.ContextSpec → AmplifyContext
export { type AmplifyContext as ContextSpec } from '@aws-amplify/core';
export { AmplifyServer } from './AmplifyServer';
export { AmplifyServerContextError } from '@aws-amplify/core';

/** @deprecated Use createAmplifyContext() + direct API calls instead */
export async function runWithAmplifyServerContext<T>(input: {
	nextServerContext: null;
	operation(contextSpec: AmplifyContext): T | Promise<T>;
}): Promise<T>;
/** @deprecated Use createAmplifyContext() + direct API calls instead */
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
