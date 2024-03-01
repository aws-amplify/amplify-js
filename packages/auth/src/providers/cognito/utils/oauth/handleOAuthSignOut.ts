// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CognitoUserPoolConfig } from '@aws-amplify/core';

import { OpenAuthSessionResult } from '../../../../utils/types';
import { DefaultOAuthStore } from '../../utils/signInWithRedirectStore';

import { completeOAuthSignOut } from './completeOAuthSignOut';
import { oAuthSignOutRedirect } from './oAuthSignOutRedirect';

export const handleOAuthSignOut = async (
	cognitoConfig: CognitoUserPoolConfig,
	store: DefaultOAuthStore,
): Promise<void | OpenAuthSessionResult> => {
	const { isOAuthSignIn } = await store.loadOAuthSignIn();

	// Clear everything before attempting to visted logout endpoint since the current application
	// state could be wiped away on redirect
	await completeOAuthSignOut(store);

	if (isOAuthSignIn) {
		// On web, this will always end up being a void action
		return oAuthSignOutRedirect(cognitoConfig);
	}
};
