// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyContext,
	AmplifyContextToken,
} from '../../context/AmplifyContext';
import { AMPLIFY_CONTEXT_BRAND } from '../../context/contextBrand';
import { createAmplifyContext } from '../../context/createAmplifyContext';
import { AmplifyServerContextError } from '../../errors/AmplifyServerContextError';
import { LibraryOptions, ResourcesConfig } from '../../singleton/types';
import { AmplifyServer } from '../AmplifyServer';

/**
 * The legacy `AmplifyClass`-shaped surface exposed on
 * {@link LegacyAmplifyServerContext.amplify}.
 *
 * It is a *reverse bridge*: a full, **branded** {@link AmplifyContext}
 * (delegating to the real per-request context) that additionally exposes the
 * `AmplifyClass` members old published consumers — notably
 * `@aws-amplify/adapter-nextjs` ≤ 1.7.3 and the code it hands the instance to —
 * touch at runtime:
 *
 * - `getConfig()` → the context's frozen `resourcesConfig`
 * - `libraryOptions` → the context's `libraryOptions`
 * - `Auth.fetchAuthSession` / `Auth.clearCredentials` / `Auth.getTokens` →
 *   delegate to the context's auth closures
 *
 * Because it is branded, new context-first internals (e.g.
 * `generateClientWithAmplifyInstance` in `@aws-amplify/api-graphql`, which the
 * old adapter passes this object to) accept it as a regular
 * {@link AmplifyContext} without re-bridging.
 *
 * Members of the old `AmplifyClass` that cannot be meaningfully supported in
 * the singleton-free model (`configure`) throw a descriptive
 * {@link AmplifyServerContextError} instead of failing with an opaque
 * `TypeError`.
 *
 * @deprecated Exists solely so OLD published `@aws-amplify/adapter-nextjs`
 * versions (≤ 1.7.3) keep working against this version of `aws-amplify`. It
 * will be removed in the next major version.
 */
export interface LegacyBridgedAmplify extends AmplifyContext {
	/** @deprecated Read {@link AmplifyContext.resourcesConfig} instead. */
	getConfig(): Readonly<ResourcesConfig>;
	/** @deprecated Call the context's auth methods directly instead. */
	readonly Auth: Pick<
		AmplifyContext,
		'fetchAuthSession' | 'clearCredentials' | 'getTokens'
	>;
	/**
	 * @deprecated Not supported on a per-request server context; always throws
	 * an {@link AmplifyServerContextError}.
	 */
	configure(): never;
}

/**
 * The envelope returned by the deprecated {@link getAmplifyServerContext},
 * mirroring the shape of the removed `AmplifyServer.Context`
 * (`{ amplify: AmplifyClass }`) with the `amplify` member replaced by the
 * {@link LegacyBridgedAmplify} reverse bridge.
 *
 * @deprecated See {@link getAmplifyServerContext}.
 */
export interface LegacyAmplifyServerContext {
	amplify: LegacyBridgedAmplify;
}

/**
 * Registry of live legacy server contexts, keyed by the per-context token
 * symbol carried on every branded {@link AmplifyContext}
 * (`contextSpec.token.value`). Entries are added by
 * {@link createAmplifyServerContext} and removed by
 * {@link destroyAmplifyServerContext}, exactly mirroring the lifecycle of the
 * removed server-context registry.
 */
const legacyServerContextRegistry = new Map<
	symbol,
	LegacyAmplifyServerContext
>();

/**
 * Builds the {@link LegacyBridgedAmplify} reverse bridge for a context.
 * The bridge is branded (it IS a valid {@link AmplifyContext} by delegation)
 * and frozen, mirroring the invariants of `createAmplifyContext`.
 */
const createLegacyBridgedAmplify = (
	ctx: AmplifyContext,
): LegacyBridgedAmplify => {
	const auth: LegacyBridgedAmplify['Auth'] = Object.freeze({
		fetchAuthSession: (
			options?: Parameters<AmplifyContext['fetchAuthSession']>[0],
		) => ctx.fetchAuthSession(options),
		clearCredentials: () => ctx.clearCredentials(),
		getTokens: (options: Parameters<AmplifyContext['getTokens']>[0]) =>
			ctx.getTokens(options),
	});

	const amplify: LegacyBridgedAmplify = {
		// Full AmplifyContext surface, delegating to the real context. The token
		// is shared so the bridge itself also resolves in the registry.
		resourcesConfig: ctx.resourcesConfig,
		libraryOptions: ctx.libraryOptions,
		token: ctx.token,
		fetchAuthSession: options => ctx.fetchAuthSession(options),
		clearCredentials: () => ctx.clearCredentials(),
		getTokens: options => ctx.getTokens(options),
		// Legacy AmplifyClass surface.
		getConfig: () => ctx.resourcesConfig,
		Auth: auth,
		configure: () => {
			throw new AmplifyServerContextError({
				message:
					'`configure()` is not supported on a server context. The legacy ' +
					'per-request `AmplifyClass` has been replaced by an immutable, ' +
					'branded `AmplifyContext`.',
				recoverySuggestion:
					'Pass the resource config and library options when creating the ' +
					'context (e.g. via `createAmplifyContext()` or ' +
					'`createAmplifyServerContext()`) instead of reconfiguring it.',
			});
		},
	};

	// Brand the bridge for runtime identification by `isAmplifyContext()`, so
	// context-first internals accept it without re-bridging (mirrors
	// `createAmplifyContext`).
	Object.defineProperty(amplify, AMPLIFY_CONTEXT_BRAND, {
		value: true,
		enumerable: false,
		configurable: false,
		writable: false,
	});

	return Object.freeze(amplify);
};

/**
 * Creates an Amplify server context.
 *
 * @deprecated This registry-backed API exists solely so OLD published
 * `@aws-amplify/adapter-nextjs` versions (≤ 1.7.3, peer `aws-amplify: ^6.16.4`)
 * — which call it (via `runWithAmplifyServerContext`) at runtime — keep working
 * against this version of `aws-amplify`. It will be removed in the next major
 * version. New code should use `createAmplifyContext()` and pass the context
 * to category APIs directly.
 *
 * Unlike the removed original (which registered a per-request `AmplifyClass`),
 * this shim builds a REAL branded `AmplifyContext` via `createAmplifyContext`
 * and returns it as the context spec: the branded context structurally
 * satisfies the legacy `ContextSpec` shape (`{ token: { value: symbol } }`),
 * so old adapter code can hand it BOTH to new context-first APIs (e.g.
 * `fetchAuthSession(contextSpec)` from `aws-amplify/auth/server`) and to the
 * legacy {@link getAmplifyServerContext} lookup.
 *
 * @param amplifyConfig The Amplify resource config.
 * @param libraryOptions The Amplify library options (the old adapter supplies
 *   cookie-backed `Auth.tokenProvider` / `Auth.credentialsProvider` here).
 * @returns The branded {@link AmplifyContext}, usable as the legacy context
 *   spec.
 */
export const createAmplifyServerContext = (
	amplifyConfig: ResourcesConfig,
	libraryOptions: LibraryOptions,
): AmplifyContext => {
	const ctx = createAmplifyContext(amplifyConfig, libraryOptions);

	legacyServerContextRegistry.set(ctx.token.value, {
		amplify: createLegacyBridgedAmplify(ctx),
	});

	return ctx;
};

/**
 * Returns an Amplify server context.
 *
 * @deprecated See {@link createAmplifyServerContext}; retained solely for OLD
 * published `@aws-amplify/adapter-nextjs` versions (≤ 1.7.3) and removed in
 * the next major version. The returned envelope's `amplify` member is a
 * {@link LegacyBridgedAmplify} reverse bridge, not an `AmplifyClass`.
 *
 * @param contextSpec The context spec used to get the Amplify server context.
 * @returns The Amplify server context.
 */
export const getAmplifyServerContext = (
	contextSpec: AmplifyServer.ContextSpec,
): LegacyAmplifyServerContext => {
	assertContextSpec(contextSpec);
	const context = legacyServerContextRegistry.get(contextSpec.token.value);

	if (context) {
		return context;
	}

	// Preserves the message of the removed original: reaching here means the
	// spec was well-formed but already destroyed (or never registered).
	throw new AmplifyServerContextError({
		message:
			'Attempted to get the Amplify Server Context that may have been destroyed.',
		recoverySuggestion:
			'Ensure always call Amplify APIs within `runWithAmplifyServerContext` function, and do not attempt to reuse `contextSpec` object.',
	});
};

/**
 * Destroys an Amplify server context.
 *
 * @deprecated See {@link createAmplifyServerContext}; retained solely for OLD
 * published `@aws-amplify/adapter-nextjs` versions (≤ 1.7.3) and removed in
 * the next major version.
 *
 * @param contextSpec The context spec used to destroy the Amplify server
 *   context.
 */
export const destroyAmplifyServerContext = (
	contextSpec: AmplifyServer.ContextSpec,
): void => {
	legacyServerContextRegistry.delete(contextSpec.token.value);
};

/**
 * Validates the structural `ContextSpec` shape exactly like the removed
 * original, so malformed input from untyped JS callers fails with the same
 * descriptive error as before.
 */
const assertContextSpec = (contextSpec: {
	token?: Partial<AmplifyContextToken>;
}) => {
	let invalid = false;

	if (!Object.prototype.hasOwnProperty.call(contextSpec, 'token')) {
		invalid = true;
	} else if (
		!Object.prototype.hasOwnProperty.call(contextSpec.token, 'value')
	) {
		invalid = true;
	} else if (
		Object.prototype.toString.call(contextSpec.token?.value) !==
		'[object Symbol]'
	) {
		invalid = true;
	}

	if (invalid) {
		throw new AmplifyServerContextError({
			message: 'Invalid `contextSpec`.',
			recoverySuggestion:
				'Ensure to use the `contextSpec` object injected by `runWithAmplifyServerContext` function.',
		});
	}
};
