// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthError } from './AuthError';

export const USER_UNAUTHENTICATED_EXCEPTION = 'UserUnAuthenticatedException';
export const USER_ALREADY_AUTHENTICATED_EXCEPTION =
	'UserAlreadyAuthenticatedException';
export const DEVICE_METADATA_NOT_FOUND_EXCEPTION =
	'DeviceMetadataNotFoundException';
export const AUTO_SIGN_IN_EXCEPTION = 'AutoSignInException';
export const INVALID_REDIRECT_EXCEPTION = 'InvalidRedirectException';
export const invalidRedirectException = new AuthError({
	name: INVALID_REDIRECT_EXCEPTION,
	message:
		'signInRedirect or signOutRedirect had an invalid format or was not found.',
	recoverySuggestion:
		'Please make sure the signIn/Out redirect in your oauth config is valid.',
});
export const INVALID_ORIGIN_EXCEPTION = 'InvalidOriginException';
export const invalidOriginException = new AuthError({
	name: INVALID_ORIGIN_EXCEPTION,
	message:
		'redirect is coming from a different origin. The oauth flow needs to be initiated from the same origin',
	recoverySuggestion: 'Please call signInWithRedirect from the same origin.',
});
export const OAUTH_SIGNOUT_EXCEPTION = 'OAuthSignOutException';
export const TOKEN_REFRESH_EXCEPTION = 'TokenRefreshException';
