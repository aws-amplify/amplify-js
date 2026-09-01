// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Tests for the overloaded top-level `fetchAuthSession` / `clearCredentials`
 * singleton APIs:
 *
 *   fetchAuthSession(options?)        — resolves the global AmplifyContext
 *   fetchAuthSession(ctx, options?)   — uses the explicitly-passed context
 *
 * Per repo convention only the boundaries are mocked (token / credentials
 * providers); the contexts are real (`createAmplifyContext` /
 * `Amplify.configure`) so brand checks, freezing, and per-context `AuthClass`
 * wiring are exercised end-to-end.
 */
import {
	AmplifyContext,
	ResourcesConfig,
	clearCredentials,
	createAmplifyContext,
	fetchAuthSession,
} from '../../../src';
import { Amplify } from '../../../src/singleton';
import { clearGlobalContext } from '../../../src/libraryUtils';
import { InvalidAmplifyContextError } from '../../../src/errors/InvalidAmplifyContextError';
import { NoAmplifyContextError } from '../../../src/errors/NoAmplifyContextError';
// The deprecated migration alias for the legacy server ContextSpec.
import { ContextSpec } from '../../../src/adapterCore';

const mockConfig: ResourcesConfig = {
	Auth: {
		Cognito: {
			userPoolId: 'us-east-1_pool',
			userPoolClientId: 'client',
			identityPoolId: 'us-east-1:identity',
		},
	},
};

// Boundary mock: a token/credentials provider pair tagged so cross-context
// leakage would be observable in the returned session.
const makeTaggedProviders = (tag: string) => {
	const tokenProvider = {
		getTokens: jest.fn(async () => ({
			accessToken: {
				payload: { sub: `sub-${tag}` },
				toString: () => `access-${tag}`,
			},
		})),
	};
	const credentialsProvider = {
		getCredentialsAndIdentityId: jest.fn(async () => ({
			identityId: `identity-${tag}`,
			credentials: {
				accessKeyId: `key-${tag}`,
				secretAccessKey: `secret-${tag}`,
			},
		})),
		clearCredentialsAndIdentityId: jest.fn(),
	};

	return { tokenProvider, credentialsProvider };
};

const makeTaggedContext = (tag: string) => {
	const providers = makeTaggedProviders(tag);
	const ctx = createAmplifyContext(mockConfig, {
		Auth: providers as any,
	});

	return { ctx, ...providers };
};

describe('fetchAuthSession / clearCredentials (context overloads)', () => {
	let globalProviders: ReturnType<typeof makeTaggedProviders>;

	beforeEach(() => {
		globalProviders = makeTaggedProviders('global');
		Amplify.configure(mockConfig, { Auth: globalProviders as any });
	});

	afterEach(() => {
		jest.clearAllMocks();
		clearGlobalContext();
		Amplify.configure({});
	});

	describe('fetchAuthSession(ctx, options?)', () => {
		it('uses the passed context’s providers, not the global’s — two contexts stay isolated', async () => {
			const a = makeTaggedContext('A');
			const b = makeTaggedContext('B');

			const [sessionA, sessionB] = await Promise.all([
				fetchAuthSession(a.ctx),
				fetchAuthSession(b.ctx),
			]);

			expect(sessionA.userSub).toBe('sub-A');
			expect(sessionA.identityId).toBe('identity-A');
			expect(sessionA.credentials?.accessKeyId).toBe('key-A');
			expect(sessionB.userSub).toBe('sub-B');
			expect(sessionB.identityId).toBe('identity-B');
			expect(sessionB.credentials?.accessKeyId).toBe('key-B');

			// The global context's providers were never touched.
			expect(globalProviders.tokenProvider.getTokens).not.toHaveBeenCalled();
			expect(
				globalProviders.credentialsProvider.getCredentialsAndIdentityId,
			).not.toHaveBeenCalled();
		});

		it('forwards the forceRefresh option to the context’s token provider', async () => {
			const a = makeTaggedContext('A');

			await fetchAuthSession(a.ctx, { forceRefresh: true });

			expect(a.tokenProvider.getTokens).toHaveBeenCalledWith(
				expect.objectContaining({ forceRefresh: true }),
			);
			expect(
				a.credentialsProvider.getCredentialsAndIdentityId,
			).toHaveBeenCalledWith(expect.objectContaining({ forceRefresh: true }));
		});
	});

	describe('fetchAuthSession(options?) — global fallback', () => {
		it('resolves the global context when no context is passed', async () => {
			const session = await fetchAuthSession();

			expect(session.userSub).toBe('sub-global');
			expect(session.identityId).toBe('identity-global');
			expect(globalProviders.tokenProvider.getTokens).toHaveBeenCalled();
		});

		it('forwards options to the global context’s providers', async () => {
			await fetchAuthSession({ forceRefresh: true });

			expect(globalProviders.tokenProvider.getTokens).toHaveBeenCalledWith(
				expect.objectContaining({ forceRefresh: true }),
			);
		});
	});

	describe('typed context guards (via resolveCtxArgs)', () => {
		it('throws the typed guard error when the first arg is an unbranded value and the context is mis-placed', async () => {
			const { ctx } = makeTaggedContext('A');

			// `fetchAuthSession(options, ctx)` — unbranded first arg with the real
			// context in a later position — must fail loudly, not silently fall
			// back to the global context.
			expect(() =>
				(fetchAuthSession as any)({ forceRefresh: true }, ctx),
			).toThrow(InvalidAmplifyContextError);
		});

		it('throws the typed error when an undefined context is explicitly passed with options', async () => {
			expect(() =>
				(fetchAuthSession as any)(undefined, { forceRefresh: true }),
			).toThrow(NoAmplifyContextError);
		});
	});

	describe('unconfigured (no global context) — pre-context back-compat', () => {
		beforeEach(() => {
			clearGlobalContext();
		});

		it('fetchAuthSession() resolves with an empty session, matching the pre-context unconfigured singleton', async () => {
			const session = await fetchAuthSession();

			// Exact base shape: all four fields present and `undefined` (the
			// unconfigured AuthClass optional-chained its missing providers).
			expect(session).toEqual({
				tokens: undefined,
				credentials: undefined,
				identityId: undefined,
				userSub: undefined,
			});
			expect(Object.keys(session).sort()).toEqual([
				'credentials',
				'identityId',
				'tokens',
				'userSub',
			]);
		});

		it('fetchAuthSession(options) also resolves with an empty session', async () => {
			await expect(fetchAuthSession({ forceRefresh: true })).resolves.toEqual({
				tokens: undefined,
				credentials: undefined,
				identityId: undefined,
				userSub: undefined,
			});
		});

		it('clearCredentials() resolves harmlessly', async () => {
			await expect(clearCredentials()).resolves.toBeUndefined();
		});
	});

	describe('clearCredentials (same overload pattern)', () => {
		it('clearCredentials(ctx) clears the passed context’s credentials only', async () => {
			const a = makeTaggedContext('A');

			await clearCredentials(a.ctx);

			expect(
				a.credentialsProvider.clearCredentialsAndIdentityId,
			).toHaveBeenCalledTimes(1);
			expect(
				globalProviders.credentialsProvider.clearCredentialsAndIdentityId,
			).not.toHaveBeenCalled();
		});

		it('clearCredentials() resolves the global context', async () => {
			await clearCredentials();

			expect(
				globalProviders.credentialsProvider.clearCredentialsAndIdentityId,
			).toHaveBeenCalledTimes(1);
		});

		it('throws the typed guard error for a mis-placed context', async () => {
			const { ctx } = makeTaggedContext('A');

			expect(() => (clearCredentials as any)({}, ctx)).toThrow(
				InvalidAmplifyContextError,
			);
		});
	});

	describe('type-level: legacy SSR ContextSpec calling pattern compiles unchanged', () => {
		it('accepts a ContextSpec (deprecated alias of AmplifyContext) as first arg', async () => {
			const { ctx, tokenProvider } = makeTaggedContext('legacy');

			// Mirrors the pre-context v6 SSR customer snippet:
			//   operation: async (contextSpec) => {
			//     const session = await fetchAuthSession(contextSpec);
			//   }
			// `ContextSpec` is the deprecated alias for `AmplifyContext`, so this
			// MUST type-check without casts. (Compile-time assertion — the calls
			// below would fail `yarn build` if the overload regressed.)
			const operation = async (contextSpec: ContextSpec) => {
				const session = await fetchAuthSession(contextSpec);

				return session;
			};
			// The options-taking legacy form must also compile.
			const operationWithOptions = async (contextSpec: ContextSpec) =>
				fetchAuthSession(contextSpec, { forceRefresh: true });
			// And ContextSpec remains assignable to AmplifyContext.
			const assignable: AmplifyContext = ctx as ContextSpec;

			const session = await operation(assignable);

			expect(session.userSub).toBe('sub-legacy');
			await operationWithOptions(ctx);
			expect(tokenProvider.getTokens).toHaveBeenLastCalledWith(
				expect.objectContaining({ forceRefresh: true }),
			);
		});
	});
});
