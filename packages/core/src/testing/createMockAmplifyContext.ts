// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '../context/AmplifyContext';
import { AMPLIFY_CONTEXT_BRAND } from '../context/contextBrand';
import { AuthTokens, JWT } from '../singleton/Auth/types';
import { LibraryOptions, ResourcesConfig } from '../singleton/types';

/**
 * Deep-partial variant of {@link ResourcesConfig} so tests can pass
 * partial / intentionally-incomplete configs to exercise error paths
 * (e.g. a missing region or userPoolId) without casting.
 */
export type MockResourcesConfig = {
	[K in keyof ResourcesConfig]?: DeepPartial<ResourcesConfig[K]>;
};

type DeepPartial<T> = T extends object
	? { [K in keyof T]?: DeepPartial<T[K]> }
	: T;

/**
 * A branded {@link AmplifyContext} whose auth methods are `jest.Mock`s, so
 * tests can call `ctx.fetchAuthSession.mockResolvedValue(...)` directly
 * without `as jest.Mock` casts.
 *
 * Note: `jest.Mock` is referenced as a **type only** (provided by the
 * `@types/jest` dev dependency); this module never imports a jest package at
 * runtime. It relies on the ambient `jest` global and is therefore only
 * usable from test code.
 */
export interface MockAmplifyContext extends AmplifyContext {
	fetchAuthSession: jest.Mock;
	clearCredentials: jest.Mock;
	getTokens: jest.Mock;
}

export interface CreateMockAmplifyContextOptions {
	/**
	 * When provided, `resourcesConfig` becomes a live getter delegating to
	 * this function so per-test config changes propagate to the context.
	 */
	getConfig?(): ResourcesConfig;
	/** Library options to expose on the context. Defaults to `{}`. */
	libraryOptions?: LibraryOptions;
	/** Override the default `jest.fn().mockResolvedValue({})` session mock. */
	fetchAuthSession?: jest.Mock;
	/** Override the default `jest.fn().mockResolvedValue(undefined)` mock. */
	clearCredentials?: jest.Mock;
	/** Override the default `jest.fn().mockResolvedValue(undefined)` mock. */
	getTokens?: jest.Mock;
}

/**
 * Creates a mock {@link AmplifyContext} for unit tests.
 *
 * The returned context is branded via {@link AMPLIFY_CONTEXT_BRAND} (so it
 * passes `isAmplifyContext()` / `resolveCtxArgs()` checks) but — unlike
 * `createAmplifyContext()` — it is deliberately **not** frozen, because tests
 * mutate the mocks between cases.
 *
 * Note: `resourcesConfig` is exposed through a getter only (read-only) —
 * unlike the per-package mocks this helper replaces, it cannot be reassigned.
 * Tests that need to change config per test should pass the
 * {@link CreateMockAmplifyContextOptions.getConfig} option (or create a new
 * context) instead of assigning `ctx.resourcesConfig`.
 *
 * @param resourcesConfig - A (deep-partial) resource config, or the options
 *   object (mirrors the per-package copies this helper consolidates).
 * @param options - Optional overrides; see {@link CreateMockAmplifyContextOptions}.
 */
export function createMockAmplifyContext(
	resourcesConfig?: MockResourcesConfig | CreateMockAmplifyContextOptions,
	options?: CreateMockAmplifyContextOptions,
): MockAmplifyContext {
	// Determine whether the first argument is the options form.
	const configIsOptions = isCreateMockAmplifyContextOptions(resourcesConfig);
	const resolvedOptions: CreateMockAmplifyContextOptions =
		(configIsOptions
			? (resourcesConfig as CreateMockAmplifyContextOptions)
			: options) ?? {};
	const staticConfig = configIsOptions
		? undefined
		: (resourcesConfig as ResourcesConfig | undefined);

	const ctx: MockAmplifyContext = {
		// Live getter so `getConfig`-driven per-test config changes propagate.
		get resourcesConfig(): ResourcesConfig {
			return resolvedOptions.getConfig
				? resolvedOptions.getConfig()
				: (staticConfig ?? {});
		},
		libraryOptions: resolvedOptions.libraryOptions ?? {},
		fetchAuthSession:
			resolvedOptions.fetchAuthSession ?? jest.fn().mockResolvedValue({}),
		clearCredentials:
			resolvedOptions.clearCredentials ??
			jest.fn().mockResolvedValue(undefined),
		getTokens:
			resolvedOptions.getTokens ?? jest.fn().mockResolvedValue(undefined),
	};

	// Brand the context (non-enumerable) for runtime identification by
	// isAmplifyContext(). Deliberately NOT frozen — see the function docs.
	Object.defineProperty(ctx, AMPLIFY_CONTEXT_BRAND, {
		value: true,
		enumerable: false,
	});

	return ctx;
}

/**
 * Convenience: primes the given mock context's session/token mocks with the
 * provided access token, so signed-request tests need a single call instead
 * of two `mockResolvedValue` invocations.
 *
 * @param ctx - A context created by {@link createMockAmplifyContext}.
 * @param accessToken - Raw token string (wrapped in a minimal {@link JWT}
 *   with an empty payload) or an already-constructed {@link JWT}.
 * @returns The same context, for chaining.
 */
export function withTokens(
	ctx: MockAmplifyContext,
	accessToken: string | JWT,
): MockAmplifyContext {
	const jwt: JWT =
		typeof accessToken === 'string'
			? { payload: {}, toString: () => accessToken }
			: accessToken;
	const tokens: AuthTokens = { accessToken: jwt };

	ctx.getTokens.mockResolvedValue(tokens);
	ctx.fetchAuthSession.mockResolvedValue({ tokens });

	return ctx;
}

function isCreateMockAmplifyContextOptions(
	value?: MockResourcesConfig | CreateMockAmplifyContextOptions,
): value is CreateMockAmplifyContextOptions {
	return (
		value != null &&
		('getConfig' in value ||
			'libraryOptions' in value ||
			'fetchAuthSession' in value ||
			'clearCredentials' in value ||
			'getTokens' in value)
	);
}
