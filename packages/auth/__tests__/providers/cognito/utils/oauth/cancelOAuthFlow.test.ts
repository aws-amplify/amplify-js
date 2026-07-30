// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { listenForOAuthFlowCancellation } from '../../../../../src/providers/cognito/utils/oauth/cancelOAuthFlow';
import { handleFailure } from '../../../../../src/providers/cognito/utils/oauth/handleFailure';
import { OAuthStore } from '../../../../../src/providers/cognito/utils/types';

jest.mock('../../../../../src/providers/cognito/utils/oauth/handleFailure');

const mockHandleFailure = handleFailure as jest.Mock;

const setUrl = (url: string) => {
	window.history.replaceState({}, '', url);
};

const setVisibility = (state: DocumentVisibilityState) => {
	Object.defineProperty(document, 'visibilityState', {
		value: state,
		configurable: true,
	});
};

const flush = () =>
	new Promise(resolve => {
		process.nextTick(resolve);
	});

describe('listenForOAuthFlowCancellation', () => {
	let store: OAuthStore;

	beforeEach(() => {
		jest.clearAllMocks();
		mockHandleFailure.mockResolvedValue(undefined);
		setUrl('/');
		setVisibility('visible');
		store = {
			loadOAuthInFlight: jest.fn().mockResolvedValue(true),
		} as unknown as OAuthStore;
	});

	describe('bfcache pageshow', () => {
		it('cancels the flow on a bfcache restore while inflight', async () => {
			listenForOAuthFlowCancellation(store);

			window.dispatchEvent(
				new PageTransitionEvent('pageshow', { persisted: true }),
			);
			await flush();

			expect(mockHandleFailure).toHaveBeenCalledTimes(1);
			expect(mockHandleFailure.mock.calls[0][0].message).toBe(
				'User cancelled OAuth flow.',
			);
		});

		it('does not cancel when the pageshow is not from bfcache', async () => {
			listenForOAuthFlowCancellation(store);

			window.dispatchEvent(
				new PageTransitionEvent('pageshow', { persisted: false }),
			);
			await flush();

			expect(mockHandleFailure).not.toHaveBeenCalled();
		});
	});

	describe('regained foreground (native sheet dismissal)', () => {
		beforeEach(() => {
			jest
				.useFakeTimers({ doNotFake: ['nextTick'] })
				.setSystemTime(new Date('2026-01-01T00:00:00Z'));
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		const advancePastGracePeriod = () => {
			jest.setSystemTime(new Date('2026-01-01T00:00:05Z'));
		};

		it('cancels the flow on visibilitychange back to visible', async () => {
			listenForOAuthFlowCancellation(store);
			advancePastGracePeriod();

			document.dispatchEvent(new Event('visibilitychange'));
			await flush();

			expect(store.loadOAuthInFlight).toHaveBeenCalled();
			expect(mockHandleFailure).toHaveBeenCalledTimes(1);
		});

		it('cancels the flow on window focus', async () => {
			listenForOAuthFlowCancellation(store);
			advancePastGracePeriod();

			window.dispatchEvent(new Event('focus'));
			await flush();

			expect(mockHandleFailure).toHaveBeenCalledTimes(1);
		});

		it('ignores visibilitychange when the page became hidden', async () => {
			listenForOAuthFlowCancellation(store);
			advancePastGracePeriod();
			setVisibility('hidden');

			document.dispatchEvent(new Event('visibilitychange'));
			await flush();

			expect(mockHandleFailure).not.toHaveBeenCalled();
		});

		it('does not cancel within the grace period', async () => {
			listenForOAuthFlowCancellation(store);

			window.dispatchEvent(new Event('focus'));
			await flush();

			expect(mockHandleFailure).not.toHaveBeenCalled();
		});

		it.each(['code=abc', 'error=access_denied', 'state=xyz'])(
			'does not cancel during a legitimate redirect (?%s)',
			async param => {
				setUrl(`/?${param}`);
				listenForOAuthFlowCancellation(store);
				advancePastGracePeriod();

				window.dispatchEvent(new Event('focus'));
				await flush();

				expect(mockHandleFailure).not.toHaveBeenCalled();
			},
		);

		it('does not cancel during an implicit flow redirect (hash tokens)', async () => {
			setUrl('/#access_token=abc&token_type=Bearer');
			listenForOAuthFlowCancellation(store);
			advancePastGracePeriod();

			window.dispatchEvent(new Event('focus'));
			await flush();

			expect(mockHandleFailure).not.toHaveBeenCalled();
		});

		it('does not cancel when no flow is inflight', async () => {
			(store.loadOAuthInFlight as jest.Mock).mockResolvedValue(false);
			listenForOAuthFlowCancellation(store);
			advancePastGracePeriod();

			window.dispatchEvent(new Event('focus'));
			await flush();

			expect(mockHandleFailure).not.toHaveBeenCalled();
		});

		it('cancels only once and removes its listeners afterwards', async () => {
			listenForOAuthFlowCancellation(store);
			advancePastGracePeriod();

			window.dispatchEvent(new Event('focus'));
			await flush();
			window.dispatchEvent(new Event('focus'));
			document.dispatchEvent(new Event('visibilitychange'));
			window.dispatchEvent(
				new PageTransitionEvent('pageshow', { persisted: true }),
			);
			await flush();

			expect(mockHandleFailure).toHaveBeenCalledTimes(1);
		});
	});
});
