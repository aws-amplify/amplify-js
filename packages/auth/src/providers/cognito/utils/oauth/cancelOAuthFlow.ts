// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { OAuthStore } from '../types';

import { createOAuthError } from './createOAuthError';
import { handleFailure } from './handleFailure';

export const listenForOAuthFlowCancellation = (store: OAuthStore) => {
	async function handleCancelOAuthFlow(event: PageTransitionEvent) {
		const isBfcache = event.persisted;
		if (isBfcache && (await store.loadOAuthInFlight())) {
			const error = createOAuthError('User cancelled OAuth flow.');
			await handleFailure(error);
		}
		window.removeEventListener('pageshow', handleCancelOAuthFlow);
	}
	window.addEventListener('pageshow', handleCancelOAuthFlow);
};
