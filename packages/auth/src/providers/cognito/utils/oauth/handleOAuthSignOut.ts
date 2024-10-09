// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CognitoUserPoolConfig } from '@aws-amplify/core';

import { OpenAuthSessionResult } from '../../../../utils/types';
import { DefaultOAuthStore } from '../../utils/signInWithRedirectStore';
import { TokenOrchestrator } from '../../tokenProvider';

import { completeOAuthSignOut } from './completeOAuthSignOut';
import { oAuthSignOutRedirect } from './oAuthSignOutRedirect';

export const handleOAuthSignOut = async (
	cognitoConfig: CognitoUserPoolConfig,
	store: DefaultOAuthStore,
	tokenOrchestrator: TokenOrchestrator,
	redirectUrl: string | undefined,
): Promise<void | OpenAuthSessionResult> => {
	const { isOAuthSignIn } = await store.loadOAuthSignIn();
	const oauthMetadata = await tokenOrchestrator.getOAuthMetadata();

	// Clear everything before attempting to visted logout endpoint since the current application
	// state could be wiped away on redirect
	await completeOAuthSignOut(store);

	// The isOAuthSignIn flag is propagated by the oAuthToken store which manages oauth keys in local storage only.
	// These keys are used to determine if a user is in an inflight or signedIn oauth states.
	// However, this behavior represents an issue when 2 apps share the same set of tokens in Cookie storage because the app that didn't
	// start the OAuth will not have access to the oauth keys.
	// A heuristic solution is to add oauth metadata to the tokenOrchestrator which will have access to the underlying
	// storage mechanism that is used by Amplify.
	if (isOAuthSignIn || oauthMetadata?.oauthSignIn) {
		// On web, this will always end up being a void action
		return oAuthSignOutRedirect(cognitoConfig, false, redirectUrl);
	}
};
