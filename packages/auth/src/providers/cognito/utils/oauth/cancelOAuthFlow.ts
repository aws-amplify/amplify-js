// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { OAuthStore } from '../types';

import { createOAuthError } from './createOAuthError';
import { handleFailure } from './handleFailure';

/**
 * Minimum time that must elapse after starting an OAuth flow before a regained
 * focus/visibility event may be interpreted as a cancellation. Guards against
 * the focus/visibility events that fire while the browser is still handing the
 * page over to the identity provider.
 */
const CANCELLATION_GRACE_PERIOD_MS = 2000;

const OAUTH_RESPONSE_PARAMS = [
	'code',
	'error',
	'state',
	'access_token',
	'id_token',
];

const hasOAuthResponseParams = (): boolean => {
	const { search, hash } = window.location;
	const searchParams = new URLSearchParams(search);
	const hashParams = new URLSearchParams(
		hash.startsWith('#') ? hash.substring(1) : hash,
	);

	return OAUTH_RESPONSE_PARAMS.some(
		param => searchParams.has(param) || hashParams.has(param),
	);
};

export const listenForOAuthFlowCancellation = (store: OAuthStore) => {
	const flowStartedAt = Date.now();
	let settled = false;

	const cleanUpListeners = () => {
		settled = true;
		window.removeEventListener('pageshow', handleCancelOAuthFlow);
		window.removeEventListener('focus', handleRegainedForeground);
		document.removeEventListener('visibilitychange', handleVisibilityChange);
	};

	const cancelFlow = async () => {
		cleanUpListeners();
		await handleFailure(createOAuthError('User cancelled OAuth flow.'));
	};

	async function handleCancelOAuthFlow(event: PageTransitionEvent) {
		if (settled) {
			return;
		}
		const isBfcache = event.persisted;
		if (isBfcache && (await store.loadOAuthInFlight())) {
			await cancelFlow();

			return;
		}
		cleanUpListeners();
	}

	async function handleRegainedForeground() {
		if (settled) {
			return;
		}

		// a legitimate redirect round-trip is being processed; never interfere
		if (hasOAuthResponseParams()) {
			cleanUpListeners();

			return;
		}

		// too early to distinguish a dismissed provider UI from the hand-off to it
		if (Date.now() - flowStartedAt < CANCELLATION_GRACE_PERIOD_MS) {
			return;
		}

		if (!(await store.loadOAuthInFlight())) {
			cleanUpListeners();

			return;
		}

		await cancelFlow();
	}

	function handleVisibilityChange() {
		if (document.visibilityState !== 'visible') {
			return;
		}
		handleRegainedForeground().catch(() => undefined);
	}

	window.addEventListener('pageshow', handleCancelOAuthFlow);
	window.addEventListener('focus', handleRegainedForeground);
	document.addEventListener('visibilitychange', handleVisibilityChange);
};
