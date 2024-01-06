// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthError } from '../../../../errors/AuthError';
import { AuthErrorTypes } from '../../../../types/Auth';
import { oAuthStore } from './oAuthStore';

export const flowCancelledMessage = '`signInWithRedirect` has been canceled.';
export const validationFailedMessage =
	'An error occurred while validating the state.';
export const validationRecoverySuggestion =
	'Try to initiate an OAuth flow from Amplify';

export const validateState = async (state?: string | null): Promise<string> => {
	const savedState = await oAuthStore.loadOAuthState();

	// This is because savedState only exists if the flow was initiated by Amplify
	const validatedState = state === savedState ? savedState : undefined;
	if (!validatedState) {
		throw new AuthError({
			name: AuthErrorTypes.OAuthSignInError,
			message: state === null ? flowCancelledMessage : validationFailedMessage,
			recoverySuggestion:
				state === null ? undefined : validationRecoverySuggestion,
		});
	}
	return validatedState;
};
