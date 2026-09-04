// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Deprecated, registry-backed `runWithAmplifyServerContext` restored at its
// original specifier and signature (`(amplifyConfig, libraryOptions,
// operation)`) solely so OLD published `@aws-amplify/adapter-nextjs` versions
// (≤ 1.7.3) keep working against this version of `aws-amplify`. Removed in the
// next major version.
export { runWithAmplifyServerContext } from './runWithAmplifyServerContext';
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
