// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext, Hub } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';

import { DefaultOAuthStore } from '../../utils/signInWithRedirectStore';
import { tokenOrchestrator } from '../../tokenProvider';

export const completeOAuthSignOut = async (
	ctx: AmplifyContext,
	store: DefaultOAuthStore,
) => {
	await store.clearOAuthData();
	tokenOrchestrator.clearTokens();
	await ctx.clearCredentials();
	Hub.dispatch('auth', { event: 'signedOut' }, 'Auth', AMPLIFY_SYMBOL);
};
