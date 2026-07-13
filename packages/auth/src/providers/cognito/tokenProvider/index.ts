// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export {
	refreshAuthTokens,
	refreshAuthTokensWithoutDedupe,
} from '../utils/refreshAuthTokens';
export { DefaultTokenStore, createKeysForAuthStorage } from './TokenStore';
export { TokenOrchestrator } from './TokenOrchestrator';
export { createAuthSessionSwitcher } from './createAuthSessionSwitcher';
export { AuthSessionSwitcher } from './types';
export { CognitoUserPoolTokenProviderType } from './types';
export {
	cognitoUserPoolsTokenProvider,
	tokenOrchestrator,
} from './tokenProvider';
export { AUTH_KEY_PREFIX } from './constants';
