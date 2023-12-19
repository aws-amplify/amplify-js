// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub } from '@aws-amplify/core';
import { authErrorMessages } from '../../../../Errors';
import { AuthErrorCodes } from '../../../../common/AuthErrorStrings';
import { AuthError } from '../../../../errors/AuthError';
import { oAuthStore } from './oAuthStore';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';

export const handleFailure = async (
	errorMessage: string | null
): Promise<void> => {
	const error = new AuthError({
		message: errorMessage ?? 'An error has occurred during the oauth process.',
		name: AuthErrorCodes.OAuthSignInError,
		recoverySuggestion: authErrorMessages.oauthSignInError.log,
	});
	await oAuthStore.clearOAuthInflightData();
	Hub.dispatch(
		'auth',
		{ event: 'signInWithRedirect_failure', data: { error } },
		'Auth',
		AMPLIFY_SYMBOL
	);
	throw new AuthError({
		message: errorMessage ?? '',
		name: AuthErrorCodes.OAuthSignInError,
		recoverySuggestion: authErrorMessages.oauthSignInError.log,
	});
};
