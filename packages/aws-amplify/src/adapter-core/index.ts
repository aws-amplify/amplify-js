// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export {
	createServerRunner,
	type CreateServerRunnerInput,
	type RunWithContextInput,
} from './createServerRunner';
export { runWithAmplifyServerContext } from './runWithAmplifyServerContext';
export { createKeyValueStorageFromCookieStorageAdapter } from './storageFactories';
export {
	createAWSCredentialsAndIdentityIdProvider,
	createUserPoolsTokenProvider,
} from './authProvidersFactories/cognito';
export { createTokenValidator } from './createTokenValidator';
export { createGlobalSettings, type GlobalSettings } from './globalSettings';
export { isValidOrigin, isSSLOrigin } from './origin';
export {
	/** @deprecated This type is deprecated and will be removed in future versions. */
	LegacyConfig,
	/** @deprecated This type is deprecated and will be removed in future versions. */
	AmplifyOutputs,
} from '@aws-amplify/core/internals/utils';
export {
	AmplifyServer,
	CookieStorage,
} from '@aws-amplify/core/internals/adapter-core';
export {
	generateState,
	getRedirectUrl,
	generateCodeVerifier,
	validateState,
	createKeysForAuthStorage,
	AUTH_KEY_PREFIX,
} from '@aws-amplify/auth/cognito';
export { DEFAULT_AUTH_TOKEN_COOKIES_MAX_AGE } from './constants';
export { ensureEncodedForJSCookie } from './cookie/ensureEncodedForJSCookie';
export { serializeCookie } from './cookie/serializeCookie';
