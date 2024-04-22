// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { OAuthStore } from '../types';

import { createOAuthError } from './createOAuthError';
import { handleFailure,  } from './index';

export const listenForOAuthFlowCancellation = (store: OAuthStore) => {
	async function handleCancelOauthFlow(event: PageTransitionEvent) {
		const isOAuthInFlight = await store.loadOAuthInFlight();
		if (event.persisted && isOAuthInFlight) {  
			await handleFailure(createOAuthError('User cancelled OAuth flow.'));
			window.removeEventListener('pageshow', handleCancelOauthFlow);
		}
	}
	window.addEventListener('pageshow', handleCancelOauthFlow);
};
