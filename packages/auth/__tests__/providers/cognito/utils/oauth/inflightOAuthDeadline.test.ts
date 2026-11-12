// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub, defaultStorage } from '@aws-amplify/core';

import { TokenOrchestrator } from '../../../../../src/providers/cognito/tokenProvider/TokenOrchestrator';
import { AUTH_KEY_PREFIX } from '../../../../../src/providers/cognito/tokenProvider/constants';
import {
	DefaultOAuthStore,
	OAUTH_INFLIGHT_TTL_MS,
} from '../../../../../src/providers/cognito/utils/signInWithRedirectStore';
import { oAuthStore } from '../../../../../src/providers/cognito/utils/oauth/oAuthStore';
import { resolveAndClearInflightPromises } from '../../../../../src/providers/cognito/utils/oauth/inflightPromise';
import { attemptCompleteOAuthFlow } from '../../../../../src/providers/cognito/utils/oauth/attemptCompleteOAuthFlow';
import { AuthTokenStore } from '../../../../../src/providers/cognito/tokenProvider/types';

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

// Bounded microtask drain, used ONLY ahead of NEGATIVE (`isSettled() === false`)
// assertions, where it is safe by construction: draining too little can only
// make the assertion weaker, never flaky-pass a regression, and extra passes
// only strengthen it. POSITIVE assertions never rely on this — they `await`
// the parked promise itself, which is deterministic at any async-chain depth
// and turns a regression into a hard jest timeout instead of a silent
// under-drain (jest's jsdom provides neither setImmediate nor MessageChannel
// for a true macrotask boundary).
const drainMicrotasks = async () => {
	for (let i = 0; i < 25; i++) {
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

interface HeldRead {
	started: Promise<void>;
	deliver(): void;
	fail(error: unknown): void;
}

const heldReads: HeldRead[] = [];

// Holds the next `count` reads of the deadline key at the storage boundary.
// Each read captures the stored value when it starts and returns it only when
// delivered, like a slow storage backend.
const holdDeadlineReads = (count: number) => {
	const getItem = defaultStorage.getItem.bind(defaultStorage);
	const holds = Array.from({ length: count }, () => {
		let markStarted!: () => void;
		let settle!: (read: () => Promise<string | null>) => void;
		const value = new Promise<() => Promise<string | null>>(resolve => {
			settle = resolve;
		});
		let captured: string | null = null;
		const held: HeldRead & { start(value: string | null): void } = {
			started: new Promise<void>(resolve => {
				markStarted = resolve;
			}),
			start(storedValue) {
				captured = storedValue;
				markStarted();
			},
			deliver: () => {
				settle(async () => captured);
			},
			fail: error => {
				settle(() => Promise.reject(error));
			},
		};

		return { held, value };
	});
	const pending = [...holds];
	jest.spyOn(defaultStorage, 'getItem').mockImplementation(async key => {
		const next = key === deadlineKey ? pending.shift() : undefined;
		if (!next) {
			return getItem(key);
		}
		next.held.start(window.localStorage.getItem(key));

		return (await next.value)();
	});
	heldReads.push(...holds.map(({ held }) => held));

	return holds.map(({ held }) => held);
};

const oauthConfig = {
	Cognito: {
		...authConfig.Cognito,
		loginWith: {
			oauth: {
				domain: 'auth.example.com',
				redirectSignIn: ['http://localhost/'],
				redirectSignOut: ['http://localhost/'],
				responseType: 'code' as const,
				scopes: ['openid'],
			},
		},
	},
};

const priorTokens = {
	accessToken: {
		payload: { exp: Math.floor(Date.now() / 1000) + 3600 },
		toString: () => 'prior-access-token',
	},
	idToken: {
		payload: { exp: Math.floor(Date.now() / 1000) + 3600 },
		toString: () => 'prior-id-token',
	},
	clockDrift: 0,
};

const createSignedInOrchestrator = () => {
	const orchestrator = createOrchestrator();
	orchestrator.setAuthTokenStore({
		loadTokens: async () => priorTokens,
		getLastAuthUser: async () => 'prior-user',
	} as unknown as AuthTokenStore);

	return orchestrator;
};

const listenForRedirectFailure = () => {
	const errors: Error[] = [];
	const stop = Hub.listen('auth', ({ payload }) => {
		const { event, data } = payload as {
			event: string;
			data?: { error?: Error };
		};
		if (event === 'signInWithRedirect_failure' && data?.error) {
			errors.push(data.error);
		}
	});

	return { errors, stop };
};

describe('inflight OAuth blocking deadline', () => {
	beforeEach(() => {
		jest.useFakeTimers();
		window.localStorage.clear();
		oAuthStore.setAuthConfig(authConfig.Cognito as any);
	});

	afterEach(async () => {
		// Drain any parked waiters and clear their backstop timers so
		// module-level state never leaks between tests.
		resolveAndClearInflightPromises();
		heldReads.splice(0).forEach(held => {
			held.deliver();
		});
		await drainMicrotasks();
		resolveAndClearInflightPromises();
		jest.restoreAllMocks();
		window.history.replaceState({}, '', '/');
		jest.clearAllTimers();
		jest.useRealTimers();
	});

	it('does not block when no OAuth flow is in flight', async () => {
		const orchestrator = createOrchestrator();

		// Deterministic positive assertion: resolves without any timer advance,
		// or times out the test on regression.
		await park(orchestrator).promise;
	});

	it('parks while a flow is in flight and releases once the deadline passes, without mutating shared state', async () => {
		await oAuthStore.storeOAuthInFlight(true);
		await defaultStorage.setItem(pkceKey, 'test-pkce');
		await defaultStorage.setItem(stateKey, 'test-state');

		const orchestrator = createOrchestrator();
		const waiter = park(orchestrator);
		await drainMicrotasks();
		expect(waiter.isSettled()).toBe(false);

		// One millisecond before the deadline: still parked.
		await jest.advanceTimersByTimeAsync(OAUTH_INFLIGHT_TTL_MS - 1);
		await drainMicrotasks();
		expect(waiter.isSettled()).toBe(false);

		// Deadline passes: the backstop timer releases the waiter locally...
		await jest.advanceTimersByTimeAsync(2);
		await waiter.promise;

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
		await drainMicrotasks();
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

		await waiter.promise;
	});

	it('ignores unrelated cross-tab storage events', async () => {
		await oAuthStore.storeOAuthInFlight(true);

		const orchestrator = createOrchestrator();
		const waiter = park(orchestrator);
		await drainMicrotasks();

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
		await drainMicrotasks();

		expect(waiter.isSettled()).toBe(false);
	});

	it('extends a parked wait when the deadline is renewed by a fresh flow', async () => {
		await oAuthStore.storeOAuthInFlight(true);

		const orchestrator = createOrchestrator();
		const waiter = park(orchestrator);
		await drainMicrotasks();

		// One minute in, a fresh signInWithRedirect renews the deadline.
		await jest.advanceTimersByTimeAsync(60_000);
		await oAuthStore.storeOAuthInFlight(true);

		// Original deadline passes: the backstop re-checks, finds the renewed
		// deadline, and re-arms instead of releasing.
		await jest.advanceTimersByTimeAsync(OAUTH_INFLIGHT_TTL_MS - 60_000 + 1);
		await drainMicrotasks();
		expect(waiter.isSettled()).toBe(false);

		// Renewed deadline passes: released.
		await jest.advanceTimersByTimeAsync(60_000 + 1);
		await waiter.promise;
	});

	it('does not block on an expired flow, while the completion gate still sees it', async () => {
		await oAuthStore.storeOAuthInFlight(true);
		await jest.advanceTimersByTimeAsync(OAUTH_INFLIGHT_TTL_MS + 1);
		resolveAndClearInflightPromises();

		const orchestrator = createOrchestrator();

		// Read-time evaluation: nothing to block on.
		await park(orchestrator).promise;
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
		await drainMicrotasks();

		// An earlier release (e.g. a cross-tab event) drains waiters and clears
		// the backstop timer ...
		resolveAndClearInflightPromises();
		await first.promise;

		// ... yet a subsequent park while the flag is still active must arm its
		// own backstop rather than rely on a timer that no longer exists.
		const second = park(createOrchestrator());
		await drainMicrotasks();
		expect(second.isSettled()).toBe(false);

		await jest.advanceTimersByTimeAsync(OAUTH_INFLIGHT_TTL_MS + 1);
		await second.promise;
	});

	it('blocks on a new flow parked on the SAME orchestrator right after a release', async () => {
		// A caller arriving for a NEW flow immediately after a release must get
		// a fresh park — not a stale, already-resolved promise that would let it
		// skip blocking.
		await oAuthStore.storeOAuthInFlight(true);
		const orchestrator = createOrchestrator();

		const first = park(orchestrator);
		await drainMicrotasks();

		// Flow 1 settles in another tab; waiters drain.
		resolveAndClearInflightPromises();
		await first.promise;

		// Flow 2 starts; the SAME orchestrator is asked to wait again.
		await oAuthStore.storeOAuthInFlight(true);
		const second = park(orchestrator);
		await drainMicrotasks();
		expect(second.isSettled()).toBe(false);

		await jest.advanceTimersByTimeAsync(OAUTH_INFLIGHT_TTL_MS + 1);
		await second.promise;
	});
	describe('when the redirect completes while a deadline read is pending', () => {
		it.each([
			{
				failure: 'an invalid origin',
				url: '/',
				redirectSignIn: ['https://elsewhere.example.com/'],
				message: /different origin/,
			},
			{
				failure: 'a denied sign-in',
				url: '/?error=access_denied&error_description=denied',
				redirectSignIn: ['http://localhost/'],
				message: /denied/,
			},
			{
				failure: 'a cancelled sign-in',
				url: '/',
				redirectSignIn: ['http://localhost/'],
				message: /cancelled/,
			},
			{
				failure: 'a state mismatch',
				url: '/?code=test-code&state=unexpected-state',
				redirectSignIn: ['http://localhost/'],
				message: /validating the state/,
			},
		])(
			'releases every waiter on $failure, and the next flow still blocks',
			async ({ url, redirectSignIn, message }) => {
				await oAuthStore.storeOAuthInFlight(true);
				await defaultStorage.setItem(stateKey, 'expected-state');
				window.history.replaceState({}, '', url);
				const failures = listenForRedirectFailure();
				const reads = holdDeadlineReads(3);

				const sessions = [1, 2, 3].map(() =>
					createSignedInOrchestrator().getTokens(),
				);
				await Promise.all(reads.map(read => read.started));

				await attemptCompleteOAuthFlow({
					...oauthConfig.Cognito,
					loginWith: {
						oauth: { ...oauthConfig.Cognito.loginWith.oauth, redirectSignIn },
					},
				});
				failures.stop();
				reads.forEach(read => {
					read.deliver();
				});

				const tokens = await Promise.all(sessions);
				expect(tokens.map(session => String(session?.accessToken))).toEqual([
					'prior-access-token',
					'prior-access-token',
					'prior-access-token',
				]);
				expect(failures.errors).toHaveLength(1);
				expect(failures.errors[0].message).toMatch(message);
				expect(window.localStorage.getItem(inflightKey)).toBeNull();

				await oAuthStore.storeOAuthInFlight(true);
				const next = park(createOrchestrator());
				await drainMicrotasks();
				expect(next.isSettled()).toBe(false);
				await jest.advanceTimersByTimeAsync(OAUTH_INFLIGHT_TTL_MS + 1);
				await next.promise;
			},
		);

		it('releases a waiter on a flag written by a legacy library version', async () => {
			window.localStorage.setItem(inflightKey, 'true');
			window.history.replaceState({}, '', '/');
			const [read] = holdDeadlineReads(1);

			const session = createSignedInOrchestrator().getTokens();
			await read.started;
			await attemptCompleteOAuthFlow(oauthConfig.Cognito);
			read.deliver();

			expect(String((await session)?.accessToken)).toBe('prior-access-token');
		});

		it('releases waiters even when clearing the flow state fails', async () => {
			await oAuthStore.storeOAuthInFlight(true);
			const cleanupError = new Error('storage unavailable');
			jest.spyOn(defaultStorage, 'removeItem').mockRejectedValue(cleanupError);
			const waiter = park(createOrchestrator());
			await drainMicrotasks();

			await expect(
				attemptCompleteOAuthFlow({
					...oauthConfig.Cognito,
					loginWith: {
						oauth: {
							...oauthConfig.Cognito.loginWith.oauth,
							redirectSignIn: ['https://elsewhere.example.com/'],
						},
					},
				}),
			).rejects.toBe(cleanupError);
			await waiter.promise;
		});
	});

	describe('when a deadline read finishes after its waiter was released', () => {
		it('does not arm a backstop for the released waiter', async () => {
			await oAuthStore.storeOAuthInFlight(true);
			const [read] = holdDeadlineReads(1);
			const released = park(createOrchestrator());
			await read.started;

			resolveAndClearInflightPromises();
			await released.promise;
			read.deliver();
			await drainMicrotasks();

			expect(jest.getTimerCount()).toBe(0);
		});

		it('leaves a newer waiter parked when the read then fails', async () => {
			await oAuthStore.storeOAuthInFlight(true);
			const [read] = holdDeadlineReads(1);
			const released = park(createOrchestrator());
			await read.started;

			resolveAndClearInflightPromises();
			await released.promise;
			const newer = park(createOrchestrator());
			read.fail(new Error('late storage failure'));
			await drainMicrotasks();

			expect(newer.isSettled()).toBe(false);
			await jest.advanceTimersByTimeAsync(OAUTH_INFLIGHT_TTL_MS + 1);
			await newer.promise;
		});

		it('rejects with the original error when the first read fails while waiting', async () => {
			await oAuthStore.storeOAuthInFlight(true);
			const readError = new Error('storage unavailable');
			const [read] = holdDeadlineReads(1);
			const failing = createOrchestrator().waitForInflightOAuth();
			await read.started;
			const sibling = park(createOrchestrator());
			await drainMicrotasks();

			read.fail(readError);

			await expect(failing).rejects.toBe(readError);
			expect(sibling.isSettled()).toBe(false);
		});
	});

	describe("when a waiter's deadline re-check is stale", () => {
		it.each([
			{
				outcome: 'reports an expired deadline',
				settle: (read: HeldRead) => {
					read.deliver();
				},
			},
			{
				outcome: 'fails',
				settle: (read: HeldRead) => {
					read.fail(new Error('storage unavailable'));
				},
			},
		])(
			'releases only that waiter when the re-check $outcome',
			async ({ settle }) => {
				await oAuthStore.storeOAuthInFlight(true);
				const stale = park(createOrchestrator());
				await drainMicrotasks();
				const [recheck] = holdDeadlineReads(1);

				await jest.advanceTimersByTimeAsync(OAUTH_INFLIGHT_TTL_MS);
				await recheck.started;
				await oAuthStore.storeOAuthInFlight(true);
				const fresh = park(createOrchestrator());
				await drainMicrotasks();

				settle(recheck);
				await stale.promise;
				await drainMicrotasks();

				expect(fresh.isSettled()).toBe(false);
				await jest.advanceTimersByTimeAsync(OAUTH_INFLIGHT_TTL_MS + 1);
				await fresh.promise;
			},
		);
	});
});
