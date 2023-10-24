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
	message: 'signInRedirect or signOutRedirect had an invalid format.',
	recoverySuggestion:
		'Please make sure the signIn/Out redirect in your oauth config is valid.',
});
