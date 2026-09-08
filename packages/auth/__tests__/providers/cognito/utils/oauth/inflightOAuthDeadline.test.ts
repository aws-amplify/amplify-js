// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { defaultStorage } from '@aws-amplify/core';

import { TokenOrchestrator } from '../../../../../src/providers/cognito/tokenProvider/TokenOrchestrator';
import { AUTH_KEY_PREFIX } from '../../../../../src/providers/cognito/tokenProvider/constants';
import {
	DefaultOAuthStore,
	OAUTH_INFLIGHT_TTL_MS,
} from '../../../../../src/providers/cognito/utils/signInWithRedirectStore';
import { oAuthStore } from '../../../../../src/providers/cognito/utils/oauth/oAuthStore';
import { resolveAndClearInflightPromises } from '../../../../../src/providers/cognito/utils/oauth/inflightPromise';

// Registers the browser-only side effects at module load — including the
// cross-tab storage listener that releases parked token consumers when the
// inflight flag is removed in another tab.
import '../../../../../src/providers/cognito/utils/oauth/enableOAuthListener';

// Per repo convention only the boundaries are mocked: `isBrowser` (so the
// browser-only branches are taken deterministically). The real oAuthStore,
// defaultStorage (jsdom localStorage), inflightPromise module, and
// TokenOrchestrator internals are exercised.
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => true),
}));

const userPoolClientId = 'test-client-id';
const authConfig = {
	Cognito: {
		userPoolId: 'us-east-1_test-id',
		userPoolClientId,
	},
};

const inflightKey = `${AUTH_KEY_PREFIX}.${userPoolClientId}.inflightOAuth`;
const deadlineKey = `${AUTH_KEY_PREFIX}.${userPoolClientId}.inflightOAuthDeadline`;
const pkceKey = `${AUTH_KEY_PREFIX}.${userPoolClientId}.oauthPKCE`;
const stateKey = `${AUTH_KEY_PREFIX}.${userPoolClientId}.oauthState`;

const flushMicrotasks = async () => {
	// Enough passes to drain the deepest async chain under test
	// (waitForInflightOAuth → store reads → waiter continuations).
	for (let i = 0; i < 10; i++) {
		await Promise.resolve();
	}
};

const createOrchestrator = () => {
	const orchestrator = new TokenOrchestrator();
	orchestrator.setAuthConfig(authConfig as any);

	return orchestrator;
};

const park = (orchestrator: TokenOrchestrator) => {
	let settled = false;
	const promise = orchestrator.waitForInflightOAuth().then(() => {
		settled = true;
	});

	return { promise, isSettled: () => settled };
};

describe('inflight OAuth blocking deadline', () => {
	beforeEach(() => {
		jest.useFakeTimers();
		window.localStorage.clear();
	});

	afterEach(async () => {
		// Drain any parked waiters and clear the singleton backstop timer so
		// module-level state never leaks between tests.
		resolveAndClearInflightPromises();
		await flushMicrotasks();
		jest.clearAllTimers();
		jest.useRealTimers();
	});

	it('does not block when no OAuth flow is in flight', async () => {
		const orchestrator = createOrchestrator();

		const waiter = park(orchestrator);
		await flushMicrotasks();

		expect(waiter.isSettled()).toBe(true);
	});

	it('parks while a flow is in flight and releases once the deadline passes, without mutating shared state', async () => {
		await oAuthStore.storeOAuthInFlight(true);
		await defaultStorage.setItem(pkceKey, 'test-pkce');
		await defaultStorage.setItem(stateKey, 'test-state');

		const orchestrator = createOrchestrator();
		const waiter = park(orchestrator);
		await flushMicrotasks();
		expect(waiter.isSettled()).toBe(false);

		// One millisecond before the deadline: still parked.
		await jest.advanceTimersByTimeAsync(OAUTH_INFLIGHT_TTL_MS - 1);
		expect(waiter.isSettled()).toBe(false);

		// Deadline passes: the backstop timer releases the waiter locally...
		await jest.advanceTimersByTimeAsync(2);
		await flushMicrotasks();
		expect(waiter.isSettled()).toBe(true);

		// ...while the (possibly still running) flow's shared state is intact:
		// only the flow-owner tab may mutate it.
		expect(window.localStorage.getItem(inflightKey)).toBe('true');
		expect(window.localStorage.getItem(deadlineKey)).not.toBeNull();
		expect(window.localStorage.getItem(pkceKey)).toBe('test-pkce');
		expect(window.localStorage.getItem(stateKey)).toBe('test-state');
	});

	it('releases parked waiters when another tab removes the inflight flag', async () => {
		await oAuthStore.storeOAuthInFlight(true);

		const orchestrator = createOrchestrator();
		const waiter = park(orchestrator);
		await flushMicrotasks();
		expect(waiter.isSettled()).toBe(false);

		// Simulate the owner tab settling the flow (success/failure both remove
		// the flag). Storage events only fire in OTHER tabs, which is exactly
		// what this simulates.
		window.dispatchEvent(
			new StorageEvent('storage', {
				key: inflightKey,
				oldValue: 'true',
				newValue: null,
				storageArea: window.localStorage,
			}),
		);
		await flushMicrotasks();

		expect(waiter.isSettled()).toBe(true);
	});

	it('ignores unrelated cross-tab storage events', async () => {
		await oAuthStore.storeOAuthInFlight(true);

		const orchestrator = createOrchestrator();
		const waiter = park(orchestrator);
		await flushMicrotasks();

		window.dispatchEvent(
			new StorageEvent('storage', {
				key: `${AUTH_KEY_PREFIX}.${userPoolClientId}.oauthSignIn`,
				oldValue: null,
				newValue: 'true,false',
				storageArea: window.localStorage,
			}),
		);
		// A NEW flow (re-)writing the flag must not release waiters either.
		window.dispatchEvent(
			new StorageEvent('storage', {
				key: inflightKey,
				oldValue: null,
				newValue: 'true',
				storageArea: window.localStorage,
			}),
		);
		await flushMicrotasks();

		expect(waiter.isSettled()).toBe(false);
	});

	it('extends a parked wait when the deadline is renewed by a fresh flow', async () => {
		await oAuthStore.storeOAuthInFlight(true);

		const orchestrator = createOrchestrator();
		const waiter = park(orchestrator);
		await flushMicrotasks();

		// One minute in, a fresh signInWithRedirect renews the deadline.
		await jest.advanceTimersByTimeAsync(60_000);
		await oAuthStore.storeOAuthInFlight(true);

		// Original deadline passes: the backstop re-checks, finds the renewed
		// deadline, and re-arms instead of releasing.
		await jest.advanceTimersByTimeAsync(OAUTH_INFLIGHT_TTL_MS - 60_000 + 1);
		expect(waiter.isSettled()).toBe(false);

		// Renewed deadline passes: released.
		await jest.advanceTimersByTimeAsync(60_000 + 1);
		await flushMicrotasks();
		expect(waiter.isSettled()).toBe(true);
	});

	it('does not block on an expired flow, while the completion gate still sees it', async () => {
		await oAuthStore.storeOAuthInFlight(true);
		await jest.advanceTimersByTimeAsync(OAUTH_INFLIGHT_TTL_MS + 1);
		resolveAndClearInflightPromises();

		const orchestrator = createOrchestrator();
		const waiter = park(orchestrator);
		await flushMicrotasks();

		// Read-time evaluation: nothing to block on.
		expect(waiter.isSettled()).toBe(true);
		// The completion path deliberately ignores the deadline so a
		// slow-but-successful login still completes.
		await expect(oAuthStore.loadOAuthInFlight()).resolves.toBe(true);
	});

	it('persists a stable default deadline for a flag written by a legacy library version', async () => {
		// A legacy writer sets the flag without a deadline key.
		window.localStorage.setItem(inflightKey, 'true');

		const firstObserved = await oAuthStore.loadOAuthInFlightDeadline();
		expect(firstObserved).toBe(Date.now() + OAUTH_INFLIGHT_TTL_MS);
		// The observed deadline is persisted (additively) ...
		expect(window.localStorage.getItem(deadlineKey)).toBe(
			String(firstObserved),
		);

		// ... so a later reader ("another tab", "after reload") sees the SAME
		// deadline instead of restarting the TTL from its own observation.
		await jest.advanceTimersByTimeAsync(60_000);
		const otherTabStore = new DefaultOAuthStore(defaultStorage);
		otherTabStore.setAuthConfig(authConfig.Cognito as any);
		await expect(otherTabStore.loadOAuthInFlightDeadline()).resolves.toBe(
			firstObserved,
		);
	});

	it('arms a fresh backstop for a park that happens after an earlier release', async () => {
		await oAuthStore.storeOAuthInFlight(true);

		const first = park(createOrchestrator());
		await flushMicrotasks();

		// An earlier release (e.g. a cross-tab event) drains waiters and clears
		// the backstop timer ...
		resolveAndClearInflightPromises();
		await flushMicrotasks();
		expect(first.isSettled()).toBe(true);

		// ... yet a subsequent park while the flag is still active must arm its
		// own backstop rather than rely on a timer that no longer exists.
		const second = park(createOrchestrator());
		await flushMicrotasks();
		expect(second.isSettled()).toBe(false);

		await jest.advanceTimersByTimeAsync(OAUTH_INFLIGHT_TTL_MS + 1);
		await flushMicrotasks();
		expect(second.isSettled()).toBe(true);
	});
});
