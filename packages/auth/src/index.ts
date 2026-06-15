// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Auth } from './Auth';
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

// chore: trigger v5-stable LTS release to complete partial publish (uuid-v11 RN fix, datastore). No functional change.
