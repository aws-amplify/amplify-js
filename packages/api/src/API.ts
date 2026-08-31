// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { V6Client } from '@aws-amplify/api-graphql';
import {
	CommonPublicClientOptions,
	DefaultCommonClientOptions,
	generateClient as internalGenerateClient,
} from '@aws-amplify/api-graphql/internals';
import {
	AMPLIFY_CONTEXT_BRAND,
	AmplifyContext,
	ResourcesConfig,
	getGlobalContext,
	hasGlobalContext,
	isAmplifyContext,
} from '@aws-amplify/core';

// Empty config returned by the lazy global-context fallback before
// `Amplify.configure()` has run. Mirrors the previous `Amplify` singleton
// fallback whose `getConfig()` returned `{}` pre-configure, so `generateClient()`
// called before configuration still yields a client whose `models` rebuild on
// the subsequent configure Hub event (rather than throwing).
const EMPTY_RESOURCES_CONFIG: ResourcesConfig = {};

/**
 * A lazy {@link AmplifyContext} that resolves the *current* global context on
 * every access instead of capturing a snapshot at client-generation time.
 *
 * `generateClient()` returns a long-lived client whose `graphql()` operations
 * read config/auth off the stored context per call. Binding a snapshot of
 * `getGlobalContext()` at generation time would go stale if the app calls
 * `Amplify.configure()` again — each configure installs a NEW frozen global
 * context. Delegating through getters keeps reconfiguration honored, preserving
 * the live-read behavior the previous `Amplify` singleton fallback provided via
 * `bridgeAmplifyClass`'s getters. Reads before configuration degrade to an empty
 * config instead of throwing (see {@link EMPTY_RESOURCES_CONFIG}).
 */
const lazyGlobalContext: AmplifyContext = {
	get resourcesConfig() {
		return hasGlobalContext()
			? getGlobalContext().resourcesConfig
			: EMPTY_RESOURCES_CONFIG;
	},
	get libraryOptions() {
		return hasGlobalContext() ? getGlobalContext().libraryOptions : {};
	},
	fetchAuthSession: options => getGlobalContext().fetchAuthSession(options),
	clearCredentials: () => getGlobalContext().clearCredentials(),
	getTokens: options => getGlobalContext().getTokens(options),
};

// Brand the lazy context so `internalGenerateClient` recognizes it as an
// AmplifyContext (via `isAmplifyContext`) and does NOT attempt to bridge it as
// an `AmplifyClass` instance.
Object.defineProperty(lazyGlobalContext, AMPLIFY_CONTEXT_BRAND, {
	value: true,
	enumerable: false,
	configurable: false,
	writable: false,
});

Object.freeze(lazyGlobalContext);

/**
 * Generates an API client that can work with models or raw GraphQL
 *
 * @returns {@link V6Client}
 * @throws {@link Error} - Throws error when client cannot be generated due to configuration issues.
 */
export function generateClient<
	T extends Record<any, any> = never,
	Options extends CommonPublicClientOptions = DefaultCommonClientOptions,
>(options?: Options): V6Client<T, Options>;

/**
 * Generates an API client bound to a specific {@link AmplifyContext} instead of
 * the global `Amplify` singleton. Use this overload when you need to scope a
 * client to an explicit context (e.g. multi-tenant or server-side rendering
 * scenarios) rather than the shared singleton configuration.
 *
 * @param ctx - The {@link AmplifyContext} the client should resolve its
 * configuration and auth from.
 * @param options - Optional client options.
 * @returns {@link V6Client}
 * @throws {@link Error} - Throws error when client cannot be generated due to configuration issues.
 *
 * @example
 * ```ts
 * import { generateClient } from 'aws-amplify/api';
 * // `listTodos` is a generated GraphQL query document (from your API's codegen output).
 *
 * const client = generateClient(ctx);
 * const result = await client.graphql({ query: listTodos });
 * ```
 */
export function generateClient<
	T extends Record<any, any> = never,
	Options extends CommonPublicClientOptions = DefaultCommonClientOptions,
>(ctx: AmplifyContext, options?: Options): V6Client<T, Options>;

export function generateClient<
	T extends Record<any, any> = never,
	Options extends CommonPublicClientOptions = DefaultCommonClientOptions,
>(
	ctxOrOptions?: AmplifyContext | Options,
	maybeOptions?: Options,
): V6Client<T, Options> {
	// When the first argument is a branded AmplifyContext, bind the client to it
	// and treat the second argument as the options. Otherwise fall back to the
	// lazy global context (resolved fresh per operation, honoring reconfigure)
	// and treat the first argument as the options. `isAmplifyContext` is inlined
	// in each ternary so its type guard narrows `ctxOrOptions` in place.
	const amplify = isAmplifyContext(ctxOrOptions)
		? ctxOrOptions
		: lazyGlobalContext;
	const options = isAmplifyContext(ctxOrOptions) ? maybeOptions : ctxOrOptions;

	return internalGenerateClient({
		...(options ?? {}),
		amplify,
	}) as unknown as V6Client<T, Options>;
}
