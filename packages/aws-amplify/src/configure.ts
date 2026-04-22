// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AMPLIFY_CONTEXT_BRAND,
	AmplifyContext,
	CookieStorage,
	LibraryOptions,
	ResourcesConfig,
	defaultStorage,
} from '@aws-amplify/core';
import {
	AmplifyOutputsUnknown,
	AuthClass,
	LegacyConfig,
	parseAmplifyConfig,
} from '@aws-amplify/core/internals/utils';

import {
	createAWSCredentialsAndIdentityIdProvider,
	createUserPoolsTokenProvider,
} from './adapter-core/authProvidersFactories/cognito';

/**
 * Creates a local {@link AmplifyContext} from the given resource configuration.
 *
 * Unlike `Amplify.configure()`, the returned context is **not** set as the
 * global context and no Hub events are dispatched. Category APIs that receive
 * this context will use it instead of the global one.
 *
 * Storage behaviour matches `Amplify.configure()`: tokens are persisted to
 * `localStorage` by default, or to cookies when `{ ssr: true }` is set.
 * Multiple contexts that share the same Auth configuration will share the
 * same underlying token storage.
 *
 * @example
 * ```ts
 * import { configure } from 'aws-amplify';
 * import outputs from './amplify_outputs.json';
 *
 * const ctx = configure(outputs);
 * // Pass ctx explicitly to category APIs:
 * await signIn(ctx, { username, password });
 * ```
 */
export function configure(
	resourceConfig: ResourcesConfig | LegacyConfig | AmplifyOutputsUnknown,
	libraryOptions?: LibraryOptions,
): AmplifyContext {
	const resolvedResourceConfig = parseAmplifyConfig(resourceConfig);
	const resolvedLibraryOptions = resolveLocalLibraryOptions(
		resolvedResourceConfig,
		libraryOptions,
	);

	const auth = new AuthClass();
	if (resolvedResourceConfig.Auth) {
		auth.configure(resolvedResourceConfig.Auth, resolvedLibraryOptions.Auth);
	}

	const ctx: AmplifyContext = {
		resourcesConfig: Object.freeze(resolvedResourceConfig),
		libraryOptions: resolvedLibraryOptions,
		fetchAuthSession: fetchOptions => auth.fetchAuthSession(fetchOptions ?? {}),
		clearCredentials: () => auth.clearCredentials(),
		getTokens: tokenOptions => auth.getTokens(tokenOptions),
	};

	// Brand the context for runtime identification by isAmplifyContext()
	Object.defineProperty(ctx, AMPLIFY_CONTEXT_BRAND, {
		value: true,
		enumerable: false,
		configurable: false,
		writable: false,
	});

	Object.freeze(ctx);

	return ctx;
}

function resolveLocalLibraryOptions(
	resourceConfig: ResourcesConfig,
	libraryOptions?: LibraryOptions,
): LibraryOptions {
	if (!resourceConfig.Auth) {
		return libraryOptions ?? {};
	}

	// User-provided providers take precedence
	if (libraryOptions?.Auth) {
		return libraryOptions;
	}

	// Resolve storage based on SSR option:
	// - ssr: true  → CookieStorage (shared between client and server)
	// - ssr: false  → defaultStorage (localStorage with server-safe fallback)
	const keyValueStorage = libraryOptions?.ssr
		? new CookieStorage({ sameSite: 'lax' })
		: defaultStorage;
	const tokenProvider = createUserPoolsTokenProvider(
		resourceConfig.Auth,
		keyValueStorage,
	);
	const credentialsProvider = createAWSCredentialsAndIdentityIdProvider(
		resourceConfig.Auth,
		keyValueStorage,
	);

	return {
		...libraryOptions,
		Auth: { tokenProvider, credentialsProvider },
	};
}
