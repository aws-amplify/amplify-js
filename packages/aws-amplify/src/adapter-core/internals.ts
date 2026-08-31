// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export {
	KeyValueStorageMethodValidator,
	CookieStorage,
	// Retained for backwards compatibility; `getAmplifyServerContext` and
	// `AmplifyServer` were removed with the server-context registry.
	AmplifyServerContextError,
} from '@aws-amplify/core/internals/adapter-core';
export { OAuthConfig } from '@aws-amplify/core';
export {
	assertOAuthConfig,
	assertTokenProviderConfig,
	urlSafeEncode,
	decodeJWT,
	AmplifyError,
	LegacyConfig,
	AmplifyOutputsUnknown,
} from '@aws-amplify/core/internals/utils';
