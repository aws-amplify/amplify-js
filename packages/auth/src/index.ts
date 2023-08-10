// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO: remove Auth and AuthClass imports/exports
import { Auth } from './Auth';
// tslint:disable-next-line no-duplicate-imports
import type { AuthClass } from './Auth';
import {
	CognitoHostedUIIdentityProvider,
	SignUpParams,
	GRAPHQL_AUTH_MODE,
} from './types/Auth';
import {
	CognitoUser,
	CookieStorage,
	appendToCognitoUserAgent,
} from 'amazon-cognito-identity-js';
import { AuthErrorStrings } from './common/AuthErrorStrings';

/**
 * @deprecated use named import
 */
export default Auth;
export {
	Auth,
	CognitoUser,
	CookieStorage,
	CognitoHostedUIIdentityProvider,
	SignUpParams,
	appendToCognitoUserAgent,
	AuthErrorStrings,
	GRAPHQL_AUTH_MODE,
};
export type { AuthClass };

// Provider specific types
export * from './providers/cognito';

// Category specific types
export * from './types';

export { fetchAuthSession } from '@aws-amplify/core';
