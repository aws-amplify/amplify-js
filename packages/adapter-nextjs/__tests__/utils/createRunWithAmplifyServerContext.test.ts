// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { sharedInMemoryStorage } from 'aws-amplify/utils';

import { createRunWithAmplifyServerContext } from '../../src/utils/createRunWithAmplifyServerContext';
import { NextServer } from '../../src/types';

// The runtime brand applied by `createAmplifyContext` (see
// `@aws-amplify/core` `contextBrand.ts`). Reconstructed here via `Symbol.for`
// so the assertions don't depend on an internal export.
const AMPLIFY_CONTEXT_BRAND = Symbol.for('amplify.context');

// Boundary mock: the cookie storage adapter derived from the Next.js request.
const mockCreateCookieStorageAdapterFromNextServerContext = jest.fn();
jest.mock(
	'../../src/utils/createCookieStorageAdapterFromNextServerContext',
	() => ({
		createCookieStorageAdapterFromNextServerContext: (...args: any[]) =>
			mockCreateCookieStorageAdapterFromNextServerContext(...args),
	}),
);

// Boundary mock: the aws-amplify adapter-core provider/storage factories. We
// deliberately use the REAL `aws-amplify` `createAmplifyContext` so that the
// branding/freezing and per-context `AuthClass` wiring are exercised for real;
// only the cookie-backed provider factories (an external boundary) are faked so
// each request's context reads tokens from its own store.
const mockCreateKeyValueStorageFromCookieStorageAdapter = jest.fn();
const mockCreateUserPoolsTokenProvider = jest.fn();
const mockCreateAWSCredentialsAndIdentityIdProvider = jest.fn();
jest.mock('aws-amplify/adapter-core', () => ({
	createKeyValueStorageFromCookieStorageAdapter: (...args: any[]) =>
		mockCreateKeyValueStorageFromCookieStorageAdapter(...args),
	createUserPoolsTokenProvider: (...args: any[]) =>
		mockCreateUserPoolsTokenProvider(...args),
	createAWSCredentialsAndIdentityIdProvider: (...args: any[]) =>
		mockCreateAWSCredentialsAndIdentityIdProvider(...args),
}));

const mockAmplifyConfig: ResourcesConfig = {
	Auth: {
		Cognito: {
			identityPoolId: '123',
			userPoolId: 'abc',
			userPoolClientId: 'def',
		},
	},
};

const mockGlobalSettings: NextServer.GlobalSettings = {
	isServerSideAuthEnabled: jest.fn(() => false),
	enableServerSideAuth: jest.fn(),
	setRuntimeOptions: jest.fn(),
	getRuntimeOptions: jest.fn(() => ({})),
	isSSLOrigin: jest.fn(() => false),
	setIsSSLOrigin: jest.fn(),
};

// Builds a fake per-request cookie storage adapter tagged with distinguishing
// token/identity values so cross-request leakage would be observable.
const makeTaggedCookieAdapter = (tag: string) => ({
	__mockTokens: { accessToken: `access-${tag}`, idToken: `id-${tag}` },
	__mockIdentityId: `identity-${tag}`,
	get: jest.fn(),
	set: jest.fn(),
	delete: jest.fn(),
	getAll: jest.fn(),
});

const buildRunner = () =>
	createRunWithAmplifyServerContext({
		config: mockAmplifyConfig,
		tokenValidator: undefined,
		globalSettings: mockGlobalSettings,
	});

describe('createRunWithAmplifyServerContext (per-request AmplifyContext)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// The key-value storage handed to the providers is the request's cookie
		// adapter; pass it through so the fake providers can read its tag.
		mockCreateKeyValueStorageFromCookieStorageAdapter.mockImplementation(
			adapter => adapter,
		);
		mockCreateUserPoolsTokenProvider.mockImplementation(
			(_authConfig: unknown, keyValueStorage: any) => ({
				getTokens: jest.fn(async () => keyValueStorage.__mockTokens),
			}),
		);
		mockCreateAWSCredentialsAndIdentityIdProvider.mockImplementation(
			(_authConfig: unknown, keyValueStorage: any) => ({
				getCredentialsAndIdentityId: jest.fn(async () => ({
					identityId: keyValueStorage.__mockIdentityId,
				})),
				clearCredentialsAndIdentityId: jest.fn(),
			}),
		);
	});

	it('passes a branded, frozen AmplifyContext to the operation and returns its result', async () => {
		mockCreateCookieStorageAdapterFromNextServerContext.mockResolvedValueOnce(
			makeTaggedCookieAdapter('X'),
		);

		const runWithAmplifyServerContext = buildRunner();
		let ctx: any;
		const operation = jest.fn(async (contextSpec: any) => {
			ctx = contextSpec;

			return 'operation-result';
		});

		const result = await runWithAmplifyServerContext({
			nextServerContext: {
				req: {},
				res: {},
			} as unknown as NextServer.Context,
			operation,
		});

		expect(result).toBe('operation-result');
		expect(operation).toHaveBeenCalledTimes(1);

		expect(AMPLIFY_CONTEXT_BRAND in ctx).toBe(true);
		expect(Object.isFrozen(ctx)).toBe(true);
		expect(typeof ctx.fetchAuthSession).toBe('function');
		expect(typeof ctx.getTokens).toBe('function');
	});

	it('builds an isolated context per request: different cookie stores yield different tokens with no cross-talk', async () => {
		const adapterA = makeTaggedCookieAdapter('A');
		const adapterB = makeTaggedCookieAdapter('B');
		mockCreateCookieStorageAdapterFromNextServerContext
			.mockResolvedValueOnce(adapterA)
			.mockResolvedValueOnce(adapterB);

		const runWithAmplifyServerContext = buildRunner();

		let ctxA: any;
		let ctxB: any;

		// Two concurrent requests, each with its own cookie store.
		const [tokensA, tokensB] = await Promise.all([
			runWithAmplifyServerContext({
				nextServerContext: {
					req: {},
					res: {},
				} as unknown as NextServer.Context,
				operation: async ctx => {
					ctxA = ctx;

					return ctx.getTokens({});
				},
			}),
			runWithAmplifyServerContext({
				nextServerContext: {
					req: {},
					res: {},
				} as unknown as NextServer.Context,
				operation: async ctx => {
					ctxB = ctx;

					return ctx.getTokens({});
				},
			}),
		]);

		// Distinct, branded, frozen per-request contexts.
		expect(ctxA).not.toBe(ctxB);
		expect(AMPLIFY_CONTEXT_BRAND in ctxA).toBe(true);
		expect(AMPLIFY_CONTEXT_BRAND in ctxB).toBe(true);
		expect(Object.isFrozen(ctxA)).toBe(true);
		expect(Object.isFrozen(ctxB)).toBe(true);

		// Each context reads only its own cookie-backed tokens — no cross-talk.
		expect(tokensA).toEqual({ accessToken: 'access-A', idToken: 'id-A' });
		expect(tokensB).toEqual({ accessToken: 'access-B', idToken: 'id-B' });

		// The token/credentials providers were bound to distinct per-request
		// stores; there is no shared server-context registry.
		expect(mockCreateUserPoolsTokenProvider).toHaveBeenCalledWith(
			mockAmplifyConfig.Auth,
			adapterA,
		);
		expect(mockCreateUserPoolsTokenProvider).toHaveBeenCalledWith(
			mockAmplifyConfig.Auth,
			adapterB,
		);
	});

	it('supports the SSR calling pattern: operation calls fetchAuthSession(contextSpec) end-to-end', async () => {
		// Mirrors the documented pre-context v6 SSR customer snippet:
		//   runWithAmplifyServerContext({
		//     nextServerContext: { req, res },
		//     operation: async (contextSpec) => {
		//       const session = await fetchAuthSession(contextSpec);
		//     },
		//   });
		// `fetchAuthSession` is the overloaded top-level API reachable from
		// `aws-amplify/auth/server`; the per-request branded context is passed
		// as its first argument.
		mockCreateCookieStorageAdapterFromNextServerContext.mockResolvedValueOnce(
			makeTaggedCookieAdapter('SSR'),
		);

		const runWithAmplifyServerContext = buildRunner();

		const session = await runWithAmplifyServerContext({
			nextServerContext: {
				req: {},
				res: {},
			} as unknown as NextServer.Context,
			operation: async contextSpec => fetchAuthSession(contextSpec),
		});

		// The session was produced by the per-request context's cookie-backed
		// providers — not any global state (no Amplify.configure ran here).
		expect(session.tokens).toEqual({
			accessToken: 'access-SSR',
			idToken: 'id-SSR',
		});
		expect(session.identityId).toBe('identity-SSR');
	});

	it('uses sharedInMemoryStorage for the unauthenticated (nextServerContext === null) path', async () => {
		const runWithAmplifyServerContext = buildRunner();
		let ctx: any;
		const operation = jest.fn(async (contextSpec: any) => {
			ctx = contextSpec;

			return undefined;
		});

		await runWithAmplifyServerContext({ nextServerContext: null, operation });

		expect(
			mockCreateCookieStorageAdapterFromNextServerContext,
		).not.toHaveBeenCalled();
		expect(mockCreateUserPoolsTokenProvider).toHaveBeenCalledWith(
			mockAmplifyConfig.Auth,
			sharedInMemoryStorage,
		);

		expect(AMPLIFY_CONTEXT_BRAND in ctx).toBe(true);
		expect(Object.isFrozen(ctx)).toBe(true);
	});
});
