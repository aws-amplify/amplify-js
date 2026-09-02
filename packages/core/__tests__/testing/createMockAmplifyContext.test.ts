// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AMPLIFY_CONTEXT_BRAND,
	ResourcesConfig,
	createMockAmplifyContext,
	isAmplifyContext,
	withTokens,
} from '../../src/testing';

describe('createMockAmplifyContext', () => {
	it('returns a branded context recognized by isAmplifyContext', () => {
		const ctx = createMockAmplifyContext();

		expect(isAmplifyContext(ctx)).toBe(true);
		expect(AMPLIFY_CONTEXT_BRAND in ctx).toBe(true);
	});

	it('keeps the brand non-enumerable', () => {
		const ctx = createMockAmplifyContext();

		expect(Object.keys(ctx)).not.toContain(AMPLIFY_CONTEXT_BRAND);
		expect(
			Object.getOwnPropertyDescriptor(ctx, AMPLIFY_CONTEXT_BRAND)?.enumerable,
		).toBe(false);
	});

	it('is NOT frozen so tests can mutate the mocks', async () => {
		const ctx = createMockAmplifyContext();

		expect(Object.isFrozen(ctx)).toBe(false);
		// Reassignment must not throw (frozen objects throw in strict mode).
		ctx.fetchAuthSession = jest.fn().mockResolvedValue({ userSub: 'sub' });
		await expect(ctx.fetchAuthSession()).resolves.toEqual({ userSub: 'sub' });
	});

	it('defaults resourcesConfig to an empty object', () => {
		expect(createMockAmplifyContext().resourcesConfig).toEqual({});
	});

	it('exposes the given (deep-partial) resourcesConfig', () => {
		// Intentionally incomplete config (no identityPoolId etc.) — must
		// compile and pass through unchanged for error-path testing.
		const config = {
			Auth: { Cognito: { userPoolId: 'us-east-1_test' } },
		};
		const ctx = createMockAmplifyContext(config);

		expect(ctx.resourcesConfig).toBe(config);
	});

	it('supports a live getConfig getter so config changes propagate', () => {
		let config: ResourcesConfig = {};
		const ctx = createMockAmplifyContext({ getConfig: () => config });

		expect(ctx.resourcesConfig).toEqual({});
		config = { API: { REST: { api: { endpoint: 'https://e.com' } } } };
		expect(ctx.resourcesConfig).toBe(config);
	});

	it('accepts libraryOptions and mock overrides via options', () => {
		const libraryOptions = { ssr: true };
		const fetchAuthSession = jest.fn().mockResolvedValue({ userSub: 'me' });
		const ctx = createMockAmplifyContext(
			{},
			{ libraryOptions, fetchAuthSession },
		);

		expect(ctx.libraryOptions).toBe(libraryOptions);
		expect(ctx.fetchAuthSession).toBe(fetchAuthSession);
	});

	it('returns jest.Mock-typed auth methods usable without casts', async () => {
		const ctx = createMockAmplifyContext();

		// No `as jest.Mock` casts needed — this is the F1.3 groundwork.
		ctx.getTokens.mockResolvedValue(undefined);
		await ctx.fetchAuthSession();
		await ctx.clearCredentials();

		expect(ctx.fetchAuthSession).toHaveBeenCalledTimes(1);
		expect(ctx.clearCredentials).toHaveBeenCalledTimes(1);
	});

	it('defaults: fetchAuthSession resolves {}, others resolve undefined', async () => {
		const ctx = createMockAmplifyContext();

		await expect(ctx.fetchAuthSession()).resolves.toEqual({});
		await expect(ctx.clearCredentials()).resolves.toBeUndefined();
		await expect(ctx.getTokens({})).resolves.toBeUndefined();
	});
});

describe('withTokens', () => {
	it('primes fetchAuthSession and getTokens with a string access token', async () => {
		const ctx = withTokens(createMockAmplifyContext(), 'access-token-123');

		const session = await ctx.fetchAuthSession();
		expect(session.tokens?.accessToken.toString()).toBe('access-token-123');
		expect(session.tokens?.accessToken.payload).toEqual({});

		const tokens = await ctx.getTokens({});
		expect(tokens?.accessToken.toString()).toBe('access-token-123');
	});

	it('accepts an already-constructed JWT', async () => {
		const jwt = { payload: { sub: 'me' }, toString: () => 'jwt-string' };
		const ctx = withTokens(createMockAmplifyContext(), jwt);

		const session = await ctx.fetchAuthSession();
		expect(session.tokens?.accessToken).toBe(jwt);
	});

	it('returns the same context for chaining', () => {
		const ctx = createMockAmplifyContext();

		expect(withTokens(ctx, 'token')).toBe(ctx);
	});
});
