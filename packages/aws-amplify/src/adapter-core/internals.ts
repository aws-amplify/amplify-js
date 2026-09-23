// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export {
	KeyValueStorageMethodValidator,
	CookieStorage,
	AmplifyServerContextError,
	// Deprecated registry-backed lookup, restored at its original specifier
	// solely so OLD published `@aws-amplify/adapter-nextjs` versions (≤ 1.7.3)
	// — whose `generateServerClient` calls
	// `getAmplifyServerContext(contextSpec).amplify` at runtime — keep working
	// against this version of `aws-amplify`. Removed in the next major version.
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
export { OAuthConfig } from '@aws-amplify/core';
// Context-producer primitives for adapter packages that construct their own
// branded `AmplifyContext` (e.g. the cookies-based data client in
// `@aws-amplify/adapter-nextjs`). Any adapter-produced context MUST be branded
// with `AMPLIFY_CONTEXT_BRAND` and carry a `createAmplifyContextToken()` token,
// mirroring the core producers.
export {
	AMPLIFY_CONTEXT_BRAND,
	isAmplifyContext,
	createAmplifyContextToken,
} from '@aws-amplify/core';
export type { AmplifyContext, AmplifyContextToken } from '@aws-amplify/core';
export {
	assertOAuthConfig,
	assertTokenProviderConfig,
	urlSafeEncode,
	decodeJWT,
	AmplifyError,
	LegacyConfig,
	AmplifyOutputsUnknown,
} from '@aws-amplify/core/internals/utils';
