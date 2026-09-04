// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AMPLIFY_CONTEXT_BRAND,
	ResourcesConfig,
	createAmplifyContext,
	isAmplifyContext,
} from '../../src';
import * as parseAmplifyConfigModule from '../../src/utils/parseAmplifyConfig';

// Real, typed resource configuration (no mocking of Amplify.getConfig or
// internals — only the injected Auth providers, which are legitimate inputs,
// are stubbed).
const resourcesConfig: ResourcesConfig = {
	Auth: {
		Cognito: {
			userPoolId: 'us-east-1_test',
			userPoolClientId: 'test-user-pool-client-id',
		},
	},
};

const buildProviders = () => {
	const tokenProvider = {
		getTokens: jest.fn().mockResolvedValue({
			accessToken: { payload: { sub: 'abc' } },
		}),
	};
	const credentialsProvider = {
		getCredentialsAndIdentityId: jest
			.fn()
			.mockResolvedValue({ credentials: { accessKeyId: 'AKIA' } }),
		clearCredentialsAndIdentityId: jest.fn().mockResolvedValue(undefined),
	};

	return { tokenProvider, credentialsProvider };
};

describe('createAmplifyContext', () => {
	describe('branding & immutability', () => {
		it('returns a value recognized by isAmplifyContext', () => {
			const ctx = createAmplifyContext(resourcesConfig);
			expect(isAmplifyContext(ctx)).toBe(true);
		});

		it('defines a non-enumerable, non-writable AMPLIFY_CONTEXT_BRAND', () => {
			const ctx = createAmplifyContext(resourcesConfig);
			const descriptor = Object.getOwnPropertyDescriptor(
				ctx,
				AMPLIFY_CONTEXT_BRAND,
			);
			expect(descriptor?.value).toBe(true);
			expect(descriptor?.enumerable).toBe(false);
			expect(descriptor?.writable).toBe(false);
			expect(descriptor?.configurable).toBe(false);
		});

		it('returns a frozen context', () => {
			const ctx = createAmplifyContext(resourcesConfig);
			expect(Object.isFrozen(ctx)).toBe(true);
		});

		it('freezes the resourcesConfig', () => {
			const ctx = createAmplifyContext(resourcesConfig);
			expect(Object.isFrozen(ctx.resourcesConfig)).toBe(true);
		});

		it('attaches a unique, frozen per-context token (data-schema ContextSpec duck-check)', () => {
			const ctxA = createAmplifyContext(resourcesConfig);
			const ctxB = createAmplifyContext(resourcesConfig);

			// The exact structural + runtime check the released
			// @aws-amplify/data-schema performs on server-op params.
			expect(typeof ctxA.token.value).toBe('symbol');
			expect(Object.isFrozen(ctxA.token)).toBe(true);

			// Unique Symbol() per context — never shared.
			expect(ctxA.token.value).not.toBe(ctxB.token.value);
		});
	});

	describe('shape', () => {
		it('exposes resourcesConfig parsed from the input', () => {
			const ctx = createAmplifyContext(resourcesConfig);
			expect(ctx.resourcesConfig.Auth?.Cognito?.userPoolId).toBe(
				'us-east-1_test',
			);
		});

		it('exposes the provided libraryOptions (passed through)', () => {
			const { tokenProvider, credentialsProvider } = buildProviders();
			const libraryOptions = { Auth: { tokenProvider, credentialsProvider } };
			const ctx = createAmplifyContext(resourcesConfig, libraryOptions);
			expect(ctx.libraryOptions).toBe(libraryOptions);
		});

		it('defaults libraryOptions to an empty object', () => {
			const ctx = createAmplifyContext(resourcesConfig);
			expect(ctx.libraryOptions).toEqual({});
		});

		it('exposes fetchAuthSession / clearCredentials / getTokens as functions', () => {
			const ctx = createAmplifyContext(resourcesConfig);
			expect(typeof ctx.fetchAuthSession).toBe('function');
			expect(typeof ctx.clearCredentials).toBe('function');
			expect(typeof ctx.getTokens).toBe('function');
		});
	});

	describe('provider wiring (fresh per-context AuthClass)', () => {
		it('routes getTokens through the injected tokenProvider', async () => {
			const { tokenProvider, credentialsProvider } = buildProviders();
			const ctx = createAmplifyContext(resourcesConfig, {
				Auth: { tokenProvider, credentialsProvider },
			});

			await ctx.getTokens({ forceRefresh: true });

			expect(tokenProvider.getTokens).toHaveBeenCalledWith({
				forceRefresh: true,
			});
		});

		it('routes fetchAuthSession through the injected providers', async () => {
			const { tokenProvider, credentialsProvider } = buildProviders();
			const ctx = createAmplifyContext(resourcesConfig, {
				Auth: { tokenProvider, credentialsProvider },
			});

			const session = await ctx.fetchAuthSession();

			expect(tokenProvider.getTokens).toHaveBeenCalled();
			expect(
				credentialsProvider.getCredentialsAndIdentityId,
			).toHaveBeenCalled();
			expect(session.credentials).toEqual({ accessKeyId: 'AKIA' });
		});

		it('routes clearCredentials through the injected credentialsProvider', async () => {
			const { tokenProvider, credentialsProvider } = buildProviders();
			const ctx = createAmplifyContext(resourcesConfig, {
				Auth: { tokenProvider, credentialsProvider },
			});

			await ctx.clearCredentials();

			expect(
				credentialsProvider.clearCredentialsAndIdentityId,
			).toHaveBeenCalledTimes(1);
		});

		it('produces independent contexts on repeated calls', () => {
			const ctx1 = createAmplifyContext(resourcesConfig);
			const ctx2 = createAmplifyContext(resourcesConfig);
			expect(ctx1).not.toBe(ctx2);
		});
	});

	describe('skipConfigParse (internal single-parse option)', () => {
		afterEach(() => {
			jest.restoreAllMocks();
		});

		it('parses the config by default (parseAmplifyConfig is invoked)', () => {
			const spy = jest.spyOn(parseAmplifyConfigModule, 'parseAmplifyConfig');
			createAmplifyContext(resourcesConfig);
			expect(spy).toHaveBeenCalledTimes(1);
		});

		it('does not re-parse when skipConfigParse is set (trusts a pre-parsed ResourcesConfig)', () => {
			const spy = jest.spyOn(parseAmplifyConfigModule, 'parseAmplifyConfig');
			const ctx = createAmplifyContext(resourcesConfig, undefined, {
				skipConfigParse: true,
			});

			// The redundant parse is skipped, yet the resulting context is
			// identical to the parsed path (the input was already normalized).
			expect(spy).not.toHaveBeenCalled();
			expect(isAmplifyContext(ctx)).toBe(true);
			expect(ctx.resourcesConfig.Auth?.Cognito?.userPoolId).toBe(
				'us-east-1_test',
			);
		});
	});

	describe('deep-freeze of resourcesConfig (both config paths)', () => {
		// Fresh config per test — deepFreeze mutates (freezes) its input in
		// place, so sharing the module-level object would couple tests.
		const buildConfig = (): ResourcesConfig => ({
			Auth: {
				Cognito: {
					userPoolId: 'us-east-1_test',
					userPoolClientId: 'test-user-pool-client-id',
				},
			},
		});

		it('deep-freezes nested config on the parse path (nested mutation throws in strict mode)', () => {
			const ctx = createAmplifyContext(buildConfig());

			expect(Object.isFrozen(ctx.resourcesConfig)).toBe(true);
			expect(Object.isFrozen(ctx.resourcesConfig.Auth)).toBe(true);
			expect(Object.isFrozen(ctx.resourcesConfig.Auth?.Cognito)).toBe(true);

			// Test modules run in strict mode, so writing to a frozen object
			// throws (it would fail silently in sloppy mode — frozen either way).
			expect(() => {
				ctx.resourcesConfig.Auth!.Cognito.userPoolId = 'us-east-1_mutated';
			}).toThrow(TypeError);
			expect(ctx.resourcesConfig.Auth?.Cognito?.userPoolId).toBe(
				'us-east-1_test',
			);
		});

		it('deep-freezes nested config on the skipConfigParse path (caller object no longer passes through mutable)', () => {
			const preParsed = buildConfig();
			const ctx = createAmplifyContext(preParsed, undefined, {
				skipConfigParse: true,
			});

			expect(Object.isFrozen(ctx.resourcesConfig)).toBe(true);
			expect(Object.isFrozen(ctx.resourcesConfig.Auth)).toBe(true);
			expect(Object.isFrozen(ctx.resourcesConfig.Auth?.Cognito)).toBe(true);

			expect(() => {
				ctx.resourcesConfig.Auth!.Cognito.userPoolId = 'us-east-1_mutated';
			}).toThrow(TypeError);
			expect(ctx.resourcesConfig.Auth?.Cognito?.userPoolId).toBe(
				'us-east-1_test',
			);
		});

		it('isolates two skipConfigParse contexts sharing the same config object (no mutation is possible)', () => {
			// adapter-nextjs passes the SAME parsed config object for every
			// per-request context; deep-freezing it is idempotent and prevents
			// one context's consumer from mutating state the other observes.
			const shared = buildConfig();
			const ctxA = createAmplifyContext(shared, undefined, {
				skipConfigParse: true,
			});
			const ctxB = createAmplifyContext(shared, undefined, {
				skipConfigParse: true,
			});

			// Both contexts intentionally reference the shared (now frozen) object.
			expect(ctxA.resourcesConfig).toBe(shared);
			expect(ctxB.resourcesConfig).toBe(shared);

			// A nested mutation attempted through ctxA throws...
			expect(() => {
				ctxA.resourcesConfig.Auth!.Cognito.userPoolId = 'us-east-1_mutated';
			}).toThrow(TypeError);

			// ...so ctxB can never observe a change (none is possible).
			expect(ctxB.resourcesConfig.Auth?.Cognito?.userPoolId).toBe(
				'us-east-1_test',
			);
		});
	});
});
