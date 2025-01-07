// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SupportedRoutePaths } from './types';

export const SUPPORTED_ROUTES: SupportedRoutePaths[] = [
	'sign-in',
	'sign-in-callback',
	'sign-up',
	'sign-out',
	'sign-out-callback',
];

export const COGNITO_IDENTITY_PROVIDERS: Record<string, string> = {
	Google: 'Google',
	Facebook: 'Facebook',
	Amazon: 'LoginWithAmazon',
	Apple: 'SignInWithApple',
};

export const PKCE_COOKIE_NAME = 'com.amplify.server_auth.pkce';
export const STATE_COOKIE_NAME = 'com.amplify.server_auth.state';
export const IS_SIGNING_OUT_COOKIE_NAME =
	'com.amplify.server_auth.isSigningOut';

// The 5 minutes is from the Cognito Social Identity Provider settings, see:
// https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-social-idp.html
export const AUTH_FLOW_PROOF_MAX_AGE = 5 * 60;

// -1 to remove the cookie immediately (0 ==> session cookie as observed)
export const REMOVE_COOKIE_MAX_AGE = -1;

// With server-side auth flow, we don't support the less secure implicit flow
export const OAUTH_GRANT_TYPE = 'authorization_code';

export const SIGN_IN_TIMEOUT_ERROR =
	'Sign in has to be completed within 5 minutes.';
