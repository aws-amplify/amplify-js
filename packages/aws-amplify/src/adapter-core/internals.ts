// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export {
	KeyValueStorageMethodValidator,
	AmplifyServerContextError,
	getAmplifyServerContext,
	AmplifyServer,
	CookieStorage,
} from '@aws-amplify/core/internals/adapter-core';
export { OAuthConfig } from '@aws-amplify/core';
export {
	assertOAuthConfig,
	assertTokenProviderConfig,
	urlSafeEncode,
	decodeJWT,
	LegacyConfig,
	AmplifyOutputsUnknown,
} from '@aws-amplify/core/internals/utils';
