// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AMPLIFY_CONTEXT_BRAND, isAmplifyContext } from '../../src';
import { bridgeAmplifyClass } from '../../src/context/bridgeAmplifyClass';
import { AmplifyClass } from '../../src/singleton/Amplify';

/**
 * Builds a bare `AmplifyClass`-shaped object exposing ONLY the surface the
 * bridge relies on: `getConfig()`, `libraryOptions`, and the cross-category
 * `Auth.{fetchAuthSession,clearCredentials,getTokens}` methods. This is the
 * exact shape that flows through the server wrapper / legacy internals, and it
 * acts as the regression guard against the bridge reading top-level context
 * methods that `AmplifyClass` does not surface.
 */
const buildBareAmplifyClass = () => {
	const auth = {
		fetchAuthSession: jest.fn().mockResolvedValue({}),
		clearCredentials: jest.fn().mockResolvedValue(undefined),
		getTokens: jest.fn().mockResolvedValue(undefined),
	};

	const raw = {
		getConfig: jest
			.fn()
			.mockReturnValue({ API: { GraphQL: { endpoint: 'e1' } } }),
		libraryOptions: { ssr: false },
		Auth: auth,
	};

	return { raw, auth };
};

describe('bridgeAmplifyClass', () => {
	describe('auth delegation (regression guard)', () => {
		it('routes fetchAuthSession through Auth.fetchAuthSession with the `{}` default arg', async () => {
			const { raw, auth } = buildBareAmplifyClass();
			const ctx = bridgeAmplifyClass(raw as unknown as AmplifyClass);

			await ctx.fetchAuthSession();

			expect(auth.fetchAuthSession).toHaveBeenCalledWith({});
		});

		it('forwards explicit fetchAuthSession options untouched', async () => {
			const { raw, auth } = buildBareAmplifyClass();
			const ctx = bridgeAmplifyClass(raw as unknown as AmplifyClass);

			await ctx.fetchAuthSession({ forceRefresh: true });

			expect(auth.fetchAuthSession).toHaveBeenCalledWith({
				forceRefresh: true,
			});
		});

		it('routes clearCredentials through Auth.clearCredentials', async () => {
			const { raw, auth } = buildBareAmplifyClass();
			const ctx = bridgeAmplifyClass(raw as unknown as AmplifyClass);

			await ctx.clearCredentials();

			expect(auth.clearCredentials).toHaveBeenCalledTimes(1);
		});

		it('routes getTokens through Auth.getTokens with the provided options', async () => {
			const { raw, auth } = buildBareAmplifyClass();
			const ctx = bridgeAmplifyClass(raw as unknown as AmplifyClass);

			await ctx.getTokens({ forceRefresh: true });

			expect(auth.getTokens).toHaveBeenCalledWith({ forceRefresh: true });
		});
	});

	describe('live config getters', () => {
		it('reflects a mutated resourcesConfig (getConfig is called per access)', () => {
			const { raw } = buildBareAmplifyClass();
			const ctx = bridgeAmplifyClass(raw as unknown as AmplifyClass);

			const updatedConfig = { API: { GraphQL: { endpoint: 'e2' } } };
			raw.getConfig.mockReturnValue(updatedConfig);

			expect(ctx.resourcesConfig).toBe(updatedConfig);
		});

		it('reflects a wholesale-reassigned libraryOptions (live getter)', () => {
			const { raw } = buildBareAmplifyClass();
			const ctx = bridgeAmplifyClass(raw as unknown as AmplifyClass);

			const updatedLibraryOptions = { ssr: true };
			raw.libraryOptions = updatedLibraryOptions;

			expect(ctx.libraryOptions).toBe(updatedLibraryOptions);
		});
	});

	describe('branding', () => {
		it('produces a value recognized by isAmplifyContext', () => {
			const { raw } = buildBareAmplifyClass();
			const ctx = bridgeAmplifyClass(raw as unknown as AmplifyClass);

			expect(isAmplifyContext(ctx)).toBe(true);
		});

		it('defines a non-enumerable AMPLIFY_CONTEXT_BRAND', () => {
			const { raw } = buildBareAmplifyClass();
			const ctx = bridgeAmplifyClass(raw as unknown as AmplifyClass);

			expect(AMPLIFY_CONTEXT_BRAND in ctx).toBe(true);
			const descriptor = Object.getOwnPropertyDescriptor(
				ctx,
				AMPLIFY_CONTEXT_BRAND,
			);
			expect(descriptor?.value).toBe(true);
			expect(descriptor?.enumerable).toBe(false);
		});

		it('returns a frozen context for parity with the other producers', () => {
			const { raw } = buildBareAmplifyClass();
			const ctx = bridgeAmplifyClass(raw as unknown as AmplifyClass);

			expect(Object.isFrozen(ctx)).toBe(true);
		});

		it('attaches a unique, frozen per-context token (data-schema ContextSpec duck-check)', () => {
			const { raw } = buildBareAmplifyClass();
			const ctxA = bridgeAmplifyClass(raw as unknown as AmplifyClass);
			const ctxB = bridgeAmplifyClass(raw as unknown as AmplifyClass);

			expect(typeof ctxA.token.value).toBe('symbol');
			expect(Object.isFrozen(ctxA.token)).toBe(true);
			expect(ctxA.token.value).not.toBe(ctxB.token.value);
		});
	});
});
