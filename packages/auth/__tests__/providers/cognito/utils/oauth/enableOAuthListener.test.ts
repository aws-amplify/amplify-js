// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { clearGlobalContext } from '@aws-amplify/core/internals/utils';

import { attemptCompleteOAuthFlow } from '../../../../../src/providers/cognito/utils/oauth/attemptCompleteOAuthFlow';
import { mockAuthConfigWithOAuth } from '../../../../mockData';

// Registers the `configure` Hub side effect at module load. Imported for its
// side effect only; the jest.mock calls below are hoisted above imports, so the
// module observes the mocked `isBrowser`/`attemptCompleteOAuthFlow`.
import '../../../../../src/providers/cognito/utils/oauth/enableOAuthListener';

// Phase C4: the listener is driven by the real `configure` Hub event published
// by `Amplify.configure()` (which sets the global context first). Per repo
// convention only the boundaries are mocked — `isBrowser` (so the browser-only
// side effect registers) and `attemptCompleteOAuthFlow` (the completion
// boundary). The real core singleton, config, and Hub are exercised.
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => true),
}));
jest.mock(
	'../../../../../src/providers/cognito/utils/oauth/attemptCompleteOAuthFlow',
);

const mockAttemptCompleteOAuthFlow = attemptCompleteOAuthFlow as jest.Mock;

// Flush pending microtasks so the guard's `.finally` (which releases the
// module-level `isHandlingOAuthFlow` flag) has run before the next assertion.
const flushPromises = () =>
	new Promise<void>(resolve => setTimeout(resolve, 0));

const createDeferred = () => {
	let resolveFn!: () => void;
	const promise = new Promise<void>(resolve => {
		resolveFn = resolve;
	});

	return { promise, resolve: resolveFn };
};

describe('enableOAuthListener', () => {
	beforeEach(() => {
		// Default: the completion boundary resolves immediately so the guard
		// releases on the next microtask (matches real fire-and-forget behavior).
		mockAttemptCompleteOAuthFlow.mockResolvedValue(undefined);
	});

	afterEach(async () => {
		// Let any in-flight guard release before clearing, so the module-level
		// flag never leaks across tests.
		await flushPromises();
		jest.clearAllMocks();
		clearGlobalContext();
	});

	it('completes the inflight OAuth flow after Amplify.configure() with an OAuth-enabled Cognito config', () => {
		Amplify.configure(mockAuthConfigWithOAuth);

		expect(mockAttemptCompleteOAuthFlow).toHaveBeenCalledTimes(1);
		expect(mockAttemptCompleteOAuthFlow).toHaveBeenCalledWith(
			expect.objectContaining({
				loginWith: expect.objectContaining({
					oauth: expect.objectContaining({ domain: 'oauth.domain.com' }),
				}),
			}),
		);
	});

	it('does not attempt completion when configured without OAuth', () => {
		Amplify.configure({
			Auth: {
				Cognito: {
					userPoolId: 'userPoolId',
					userPoolClientId: 'userPoolClientId',
				},
			},
		});

		expect(mockAttemptCompleteOAuthFlow).not.toHaveBeenCalled();
	});

	it('collapses concurrent triggers to a single completion while the first is still pending', async () => {
		// The catch-up call and the `configure` Hub listener both funnel through
		// the same synchronously-claimed guard, so a second trigger arriving while
		// the first invocation is mid-flight (StrictMode double-invoke, HMR, or a
		// double `Amplify.configure()`) is the exact double-fire race from
		// PR #14925. Model it with a completion that never settles on its own.
		const deferred = createDeferred();
		mockAttemptCompleteOAuthFlow.mockReturnValue(deferred.promise);

		// First trigger: claims the guard synchronously and starts the (pending)
		// completion.
		Amplify.configure(mockAuthConfigWithOAuth);
		// Second trigger arrives before the first settles.
		Amplify.configure(mockAuthConfigWithOAuth);

		// Only one exchange of the single-use authorization code happens.
		expect(mockAttemptCompleteOAuthFlow).toHaveBeenCalledTimes(1);

		// Once the first completion settles the guard is released, so a later
		// (non-concurrent) reconfigure is allowed to run again — in production it
		// no-ops via `oAuthStore.loadOAuthInFlight()`.
		deferred.resolve();
		await flushPromises();

		Amplify.configure(mockAuthConfigWithOAuth);
		expect(mockAttemptCompleteOAuthFlow).toHaveBeenCalledTimes(2);
	});

	it('does not produce concurrent completions across a multi-reconfigure sequence (soberm)', async () => {
		// soberm: the old contract was fire-at-most-once. Reconfiguring 3× must
		// never overlap completions. Because each completion settles before the
		// next configure here, the documented once-per-cycle contract allows each
		// reconfigure to re-enter (harmless: the real `attemptCompleteOAuthFlow`
		// no-ops via `loadOAuthInFlight` once the flow has completed), but never
		// concurrently.
		for (let i = 0; i < 3; i++) {
			Amplify.configure(mockAuthConfigWithOAuth);
			await flushPromises();
		}

		expect(mockAttemptCompleteOAuthFlow).toHaveBeenCalledTimes(3);
	});

	it('does not fire an extra completion when concurrent reconfigures overlap a pending flow', async () => {
		// Same guard, stressed with three overlapping configures: only the first
		// executes; the two that arrive while it is pending are dropped.
		const deferred = createDeferred();
		mockAttemptCompleteOAuthFlow.mockReturnValue(deferred.promise);

		Amplify.configure(mockAuthConfigWithOAuth);
		Amplify.configure(mockAuthConfigWithOAuth);
		Amplify.configure(mockAuthConfigWithOAuth);

		expect(mockAttemptCompleteOAuthFlow).toHaveBeenCalledTimes(1);

		deferred.resolve();
		await flushPromises();
	});

	it('runs the guarded import-time catch-up when a global OAuth context already exists', () => {
		// If `Amplify.configure()` ran before this module was imported, the
		// `configure` Hub event was missed; the catch-up branch must still attempt
		// completion — through the same guard. Exercised in a single isolate so the
		// listener module observes a core whose global context was set before it
		// was imported.
		jest.isolateModules(() => {
			const { Amplify: IsolatedAmplify } = require('@aws-amplify/core');
			const {
				attemptCompleteOAuthFlow: isolatedAttempt,
			} = require('../../../../../src/providers/cognito/utils/oauth/attemptCompleteOAuthFlow');
			(isolatedAttempt as jest.Mock).mockResolvedValue(undefined);

			// Configure before importing the listener → the `configure` Hub event is
			// missed and only the catch-up branch can complete the flow.
			IsolatedAmplify.configure(mockAuthConfigWithOAuth);
			require('../../../../../src/providers/cognito/utils/oauth/enableOAuthListener');

			expect(isolatedAttempt).toHaveBeenCalledTimes(1);
		});
	});
});
