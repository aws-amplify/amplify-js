// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Hub } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';

describe('Hub API happy path cases', () => {
	let stopHubListener: () => void;

	afterEach(() => {
		if (typeof stopHubListener === 'function') {
			stopHubListener();
		}
	});

	test('fetchAuthSession should dispatch tokenRefresh event when is forced to refresh tokens', async () => {
		stopHubListener = Hub.listen('auth', async ({ payload }) => {
			expect(payload.event).toBe('tokenRefresh');
		});

		function fetchAuthSessionMock({ forceRefresh }: { forceRefresh: boolean }) {
			if (forceRefresh) {
				Hub.dispatch('auth', { event: 'tokenRefresh' }, 'Auth', AMPLIFY_SYMBOL);
			}
		}

		fetchAuthSessionMock({ forceRefresh: true });
	});

	test('signInWithRedirect should  dispatch signInWithRedirect indicating it was able to resolve', async () => {
		stopHubListener = Hub.listen('auth', async ({ payload }) => {
			expect(payload.event).toBe('signInWithRedirect');
		});

		function signInWithRedirectMock() {
			Hub.dispatch(
				'auth',
				{ event: 'signInWithRedirect' },
				'Auth',
				AMPLIFY_SYMBOL
			);
		}

		signInWithRedirectMock();
	});
});

describe('Hub API negative path cases', () => {
	let stopHubListener: () => void;

	afterEach(() => {
		if (typeof stopHubListener === 'function') {
			stopHubListener();
		}
	});
	test('fetchAuthSession should dispatch tokenRefresh_failure event when the request fails to refresh tokens', async () => {
		stopHubListener = Hub.listen('auth', async ({ payload }) => {
			expect(payload.event).toBe('tokenRefresh_failure');
		});

		function fetchAuthSessionMock({ forceRefresh }: { forceRefresh: boolean }) {
			try {
				if (forceRefresh) {
					throw new Error('fail to refresh tokens');
				}
			} catch (error) {
				Hub.dispatch(
					'auth',
					{ event: 'tokenRefresh_failure' },
					'Auth',
					AMPLIFY_SYMBOL
				);
			}
		}

		fetchAuthSessionMock({ forceRefresh: true });
	});

	test('signInWithRedirect should  dispatch signInWithRedirect_failure indicating it was not able to resolve', async () => {
		stopHubListener = Hub.listen('auth', async ({ payload }) => {
			expect(payload.event).toBe('signInWithRedirect_failure');
		});

		function signInWithRedirectMock() {
			try {
				throw new Error('fail to resolve');
			} catch (e) {
				Hub.dispatch(
					'auth',
					{ event: 'signInWithRedirect_failure' },
					'Auth',
					AMPLIFY_SYMBOL
				);
			}
		}
		signInWithRedirectMock();
	});
});
