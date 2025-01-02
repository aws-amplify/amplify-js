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
export const AUTH_FLOW_PROOF_COOKIE_EXPIRY = 10 * 60 * 1000; // 10 mins
export const OAUTH_GRANT_TYPE = 'authorization_code';
