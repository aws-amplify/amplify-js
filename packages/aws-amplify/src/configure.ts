// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AMPLIFY_CONTEXT_BRAND,
	AmplifyContext,
	LibraryOptions,
	ResourcesConfig,
} from '@aws-amplify/core';
import {
	AmplifyOutputsUnknown,
	AuthClass,
	InMemoryStorage,
	KeyValueStorage,
	LegacyConfig,
	parseAmplifyConfig,
} from '@aws-amplify/core/internals/utils';

import {
	createAWSCredentialsAndIdentityIdProvider,
	createUserPoolsTokenProvider,
} from './adapter-core/authProvidersFactories/cognito';

/**
 * Creates an isolated {@link AmplifyContext} from the given resource configuration.
 *
 * The returned context is **not** stored globally — it does not affect
 * `Amplify.configure()` state and does not dispatch Hub events. Use this for
 * server-side rendering or testing where you need an isolated context.
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

	// Create fresh providers with isolated in-memory storage
	const keyValueStorage = new KeyValueStorage(new InMemoryStorage());
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
