// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { runWithAmplifyServerContext } from './runWithAmplifyServerContext';
export { createKeyValueStorageFromCookieStorageAdapter } from './storageFactories';
export {
	createAWSCredentialsAndIdentityIdProvider,
	createUserPoolsTokenProvider,
} from './authProvidersFactories/cognito';
export {
	LegacyConfig,
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
