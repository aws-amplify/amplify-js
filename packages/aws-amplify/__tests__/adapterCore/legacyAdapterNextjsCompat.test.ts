// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Backwards-compatibility test for OLD published `@aws-amplify/adapter-nextjs`
 * versions (≤ 1.7.3, peer `aws-amplify: ^6.16.4`) running against THIS version
 * of `aws-amplify`.
 *
 * Users are documented to install the adapter directly (no version-sync
 * obligation with `aws-amplify`), so old-adapter + new-aws-amplify is a
 * legitimate npm resolution. The old adapter calls the registry-backed
 * server-context API at runtime:
 *
 * - `runWithAmplifyServerContext(resourcesConfig, libraryOptions, operation)`
 *   from `aws-amplify/adapter-core`
 *   (dist/cjs/utils/createRunWithAmplifyServerContext.js), with cookie-backed
 *   `Auth.{credentialsProvider,tokenProvider}` built from the REAL
 *   `createKeyValueStorageFromCookieStorageAdapter` /
 *   `createAWSCredentialsAndIdentityIdProvider` / `createUserPoolsTokenProvider`
 *   factories, and
 * - `getAmplifyServerContext(contextSpec).amplify` from
 *   `aws-amplify/adapter-core/internals`
 *   (dist/cjs/api/generateServerClient.js), handing the instance to the NEW
 *   `generateClientWithAmplifyInstance` wrapper which treats it as an
 *   `AmplifyContext`, and
 * - NEW context-first server APIs (`getCurrentUser(contextSpec)` from
 *   `aws-amplify/auth/server` in dist/cjs/auth/utils/hasActiveUserSession.js).
 *
 * This suite transcribes those exact call shapes from the 1.7.3 dist and
 * drives the REAL shims and factories end-to-end. Only the boundary is faked:
 * the cookie store (standing in for the Next.js request cookies).
 */
import { isAmplifyContext } from '@aws-amplify/core';

import {
	AUTH_KEY_PREFIX,
	CookieStorage,
	createAWSCredentialsAndIdentityIdProvider,
	createKeyValueStorageFromCookieStorageAdapter,
	createKeysForAuthStorage,
	createUserPoolsTokenProvider,
	runWithAmplifyServerContext,
} from '../../src/adapter-core';
import {
	AmplifyContext,
	getAmplifyServerContext,
} from '../../src/adapter-core/internals';
import { fetchAuthSession, getCurrentUser } from '../../src/auth/server';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const userPoolId = 'us-east-1_testPool';
const userPoolClientId = 'testUserPoolClientId';
const username = 'testUser';
const userSub = 'user-sub-1234';

// User-pool-only config: the Cognito credentials provider silently skips when
// no identity pool is configured, keeping the whole flow offline.
const resourcesConfig = {
	Auth: {
		Cognito: {
			userPoolId,
			userPoolClientId,
		},
	},
};

const base64UrlEncode = (object: Record<string, unknown>): string =>
	btoa(JSON.stringify(object))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');

/** Creates an (unsigned) JWT string with the given payload. */
const createJwt = (payload: Record<string, unknown>): string =>
	`${base64UrlEncode({ alg: 'none', typ: 'JWT' })}.${base64UrlEncode(
		payload,
	)}.test-signature`;

const nowInSeconds = Math.floor(Date.now() / 1000);
// Far-future expiry so the token orchestrator never attempts a (network-bound)
// refresh.
const exp = nowInSeconds + 3600;

const accessTokenJwt = createJwt({
	sub: userSub,
	username,
	iat: nowInSeconds,
	exp,
});
const idTokenJwt = createJwt({
	'cognito:username': username,
	sub: userSub,
	iat: nowInSeconds,
	exp,
});

/**
 * In-memory cookie store standing in for the Next.js request cookies — the
 * only boundary fake in this suite. Implements `CookieStorage.Adapter`.
 */
const createMockCookieStorageAdapter = (): CookieStorage.Adapter => {
	const store = new Map<string, string>();

	// Seed the auth token cookies exactly as a signed-in session written by the
	// old adapter would appear.
	const keys = createKeysForAuthStorage(
		AUTH_KEY_PREFIX,
		`${userPoolClientId}.${username}`,
	);
	store.set(`${AUTH_KEY_PREFIX}.${userPoolClientId}.LastAuthUser`, username);
	store.set(keys.accessToken, accessTokenJwt);
	store.set(keys.idToken, idTokenJwt);
	store.set(keys.refreshToken, 'test-refresh-token');
	store.set(keys.clockDrift, '0');

	return {
		get(name) {
			const value = store.get(name);

			return value === undefined ? undefined : { name, value };
		},
		getAll() {
			return Array.from(store.entries()).map(([name, value]) => ({
				name,
				value,
			}));
		},
		set(name, value) {
			store.set(name, value);
		},
		delete(name) {
			store.delete(name);
		},
	};
};

/**
 * Transcription of the old adapter's
 * `dist/cjs/utils/createRunWithAmplifyServerContext.js`: the exact call shapes
 * `@aws-amplify/adapter-nextjs@1.7.3` drives against `aws-amplify/adapter-core`
 * for an authenticated (cookie-backed) request.
 */
const legacyAdapterRunWithAmplifyServerContext = async <T>(
	operation: (contextSpec: AmplifyContext) => T | Promise<T>,
): Promise<T> => {
	const keyValueStorage = createKeyValueStorageFromCookieStorageAdapter(
		createMockCookieStorageAdapter(),
		undefined,
		{ path: '/' },
	);
	const credentialsProvider = createAWSCredentialsAndIdentityIdProvider(
		resourcesConfig.Auth,
		keyValueStorage,
	);
	const tokenProvider = createUserPoolsTokenProvider(
		resourcesConfig.Auth,
		keyValueStorage,
	);

	return runWithAmplifyServerContext(
		resourcesConfig,
		{ Auth: { credentialsProvider, tokenProvider } },
		operation,
	);
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('old @aws-amplify/adapter-nextjs (≤ 1.7.3) runtime compatibility', () => {
	it('supports the new context-first server APIs with the created contextSpec (auth handlers path)', async () => {
		// Mimics dist/cjs/auth/utils/hasActiveUserSession.js:
		// `operation: contextSpec => getCurrentUser(contextSpec)`.
		const user = await legacyAdapterRunWithAmplifyServerContext(
			async contextSpec => getCurrentUser(contextSpec),
		);

		expect(user).toEqual({ username, userId: userSub });

		// And the session path used throughout old apps:
		// `operation: contextSpec => fetchAuthSession(contextSpec)`.
		const session = await legacyAdapterRunWithAmplifyServerContext(
			async contextSpec => fetchAuthSession(contextSpec),
		);

		expect(session.tokens?.accessToken.toString()).toBe(accessTokenJwt);
		expect(session.tokens?.idToken?.toString()).toBe(idTokenJwt);
		expect(session.userSub).toBe(userSub);
		// No identity pool configured — credentials silently skipped.
		expect(session.credentials).toBeUndefined();
	});

	it('supports the old `getAmplifyServerContext(contextSpec).amplify` path (generateServerClient path)', async () => {
		// Mimics dist/cjs/api/generateServerClient.js:
		// `operation: contextSpec => fn(getAmplifyServerContext(contextSpec).amplify)`
		// where `fn` is the wrapper created by the NEW
		// `generateClientWithAmplifyInstance` internals, which treats the received
		// instance as an `AmplifyContext`.
		const newInternalsWrapper = async (amplifyInstance: AmplifyContext) => {
			// The bridge must be accepted by new context-first internals as-is.
			expect(isAmplifyContext(amplifyInstance)).toBe(true);
			expect(amplifyInstance.resourcesConfig).toEqual(resourcesConfig);

			return amplifyInstance.fetchAuthSession();
		};

		const session = await legacyAdapterRunWithAmplifyServerContext(
			async contextSpec => {
				const { amplify } = getAmplifyServerContext(contextSpec);

				// Legacy AmplifyClass surface old-style consumers touch.
				expect(amplify.getConfig()).toEqual(resourcesConfig);
				expect(amplify.libraryOptions.Auth?.tokenProvider).toBeDefined();
				const legacySession = await amplify.Auth.fetchAuthSession();
				expect(legacySession.tokens?.accessToken.toString()).toBe(
					accessTokenJwt,
				);

				return newInternalsWrapper(amplify);
			},
		);

		expect(session.tokens?.accessToken.toString()).toBe(accessTokenJwt);
	});

	it('destroys the registered context after the operation completes', async () => {
		let capturedSpec: AmplifyContext | undefined;

		await legacyAdapterRunWithAmplifyServerContext(async contextSpec => {
			capturedSpec = contextSpec;
			expect(getAmplifyServerContext(contextSpec).amplify).toBeDefined();
		});

		// NOTE: `instanceof AmplifyServerContextError` has never worked — the
		// `AmplifyError` base resets the prototype (es5 transpilation hack) — so,
		// like all published consumers, we assert on the error message/name.
		expect(() => getAmplifyServerContext(capturedSpec!)).toThrow(
			'Attempted to get the Amplify Server Context that may have been destroyed.',
		);
	});

	it('supports config without Auth (API-key-only apps)', async () => {
		// Mimics the old adapter's non-Auth branch:
		// `runWithAmplifyServerContext(resourcesConfig, {}, operation)`.
		const apiOnlyConfig = {
			API: {
				GraphQL: {
					endpoint: 'https://example.appsync-api.amazonaws.com/graphql',
					defaultAuthMode: 'apiKey' as const,
					apiKey: 'da2-test',
				},
			},
		};

		const receivedConfig = await runWithAmplifyServerContext(
			apiOnlyConfig,
			{},
			contextSpec => getAmplifyServerContext(contextSpec).amplify.getConfig(),
		);

		expect(receivedConfig).toEqual(apiOnlyConfig);
	});
});
