// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyContext,
	AuthSession,
	AuthTokens,
	CookieStorage,
	FetchAuthSessionOptions,
	Hub,
	LibraryOptions,
	ResourcesConfig,
	createAmplifyContext,
	defaultStorage,
	getGlobalContext,
	hasGlobalContext,
} from '@aws-amplify/core';
import {
	AMPLIFY_SYMBOL,
	AmplifyOutputsUnknown,
	LegacyConfig,
	parseAmplifyConfig,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';

import {
	CognitoAWSCredentialsAndIdentityIdProvider,
	DefaultIdentityIdStore,
	cognitoCredentialsProvider,
	cognitoUserPoolsTokenProvider,
} from './auth/cognito';

/**
 * The `Amplify` singleton facade provides the v6-compatible, global-state
 * `configure()` / `getConfig()` API. It builds a branded, frozen
 * {@link AmplifyContext}, publishes it as the global context (so category APIs
 * can be called without an explicit context argument), and dispatches the
 * `configure` Hub event that side effects such as auth's OAuth listener depend
 * on.
 *
 * @example
 * ```ts
 * import { Amplify } from 'aws-amplify';
 * import config from './amplifyconfiguration.json';
 *
 * Amplify.configure(config);
 * ```
 */
export const Amplify = {
	/**
	 * Configures Amplify with the {@link resourceConfig} and {@link libraryOptions},
	 * publishing the resulting branded context as the global {@link AmplifyContext}.
	 *
	 * If `libraryOptions` is omitted on a reconfigure, the previously configured
	 * `libraryOptions` are preserved (mirroring the previous singleton merge
	 * behavior); when provided they replace the previous ones. When
	 * `resourceConfig.Auth` is present and the caller does not supply
	 * `libraryOptions.Auth`, the default Cognito token/credentials providers are
	 * wired using cookie storage (`ssr: true`) or `localStorage` (default).
	 *
	 * @param resourceConfig The {@link ResourcesConfig} object that is typically imported from the
	 * `amplifyconfiguration.json` / `amplify_outputs.json` file. It can also be an object literal
	 * created inline when calling `Amplify.configure`.
	 * @param libraryOptions The {@link LibraryOptions} additional options for the library.
	 *
	 * @example
	 * import config from './amplifyconfiguration.json';
	 *
	 * Amplify.configure(config);
	 */
	configure(
		resourceConfig: ResourcesConfig | LegacyConfig | AmplifyOutputsUnknown,
		libraryOptions?: LibraryOptions,
	): void {
		const resolvedResourceConfig = parseAmplifyConfig(resourceConfig);
		const previousLibraryOptions = hasGlobalContext()
			? getGlobalContext().libraryOptions
			: undefined;
		const resolvedLibraryOptions = resolveLibraryOptions(
			resolvedResourceConfig,
			libraryOptions,
			previousLibraryOptions,
		);

		// Build a branded + frozen context (with a fresh per-context AuthClass)
		// via the core factory, then publish it as the global context.
		const ctx = createAmplifyContext(
			resolvedResourceConfig,
			resolvedLibraryOptions,
		);
		setGlobalContext(ctx);

		// Notify listeners (e.g. auth's OAuth completion side effect) that the
		// library has been (re)configured. The payload `data` carries the parsed
		// ResourcesConfig so listeners can read `data.Auth.Cognito`.
		Hub.dispatch(
			'core',
			{
				event: 'configure',
				data: resolvedResourceConfig,
			},
			'Configure',
			AMPLIFY_SYMBOL,
		);
	},

	/**
	 * Returns the {@link ResourcesConfig} object passed in as the `resourceConfig` parameter when
	 * calling `Amplify.configure`.
	 *
	 * @returns An {@link ResourcesConfig} object.
	 * @throws If `configure()` has not been called yet.
	 */
	getConfig(): ResourcesConfig {
		return getGlobalContext().resourcesConfig;
	},

	/**
	 * Fetches the current auth session from the global context.
	 *
	 * @throws If `configure()` has not been called yet.
	 */
	fetchAuthSession(options?: FetchAuthSessionOptions): Promise<AuthSession> {
		return getGlobalContext().fetchAuthSession(options);
	},

	/**
	 * Clears cached credentials in the global context.
	 *
	 * @throws If `configure()` has not been called yet.
	 */
	clearCredentials(): Promise<void> {
		return getGlobalContext().clearCredentials();
	},

	/**
	 * Fetches auth tokens from the global context.
	 *
	 * @throws If `configure()` has not been called yet.
	 */
	getTokens(options: FetchAuthSessionOptions): Promise<AuthTokens | undefined> {
		return getGlobalContext().getTokens(options);
	},
};

/**
 * Resolves the effective {@link LibraryOptions} for the global singleton,
 * preserving the previous `DefaultAmplify`-style default-provider
 * behavior (process-wide **singleton** Cognito providers, `setAuthConfig` /
 * `setKeyValueStorage` refresh).
 *
 * - No new `libraryOptions` but previous ones exist → preserve previous.
 * - No `Auth` in the resource config → pass options through unchanged.
 * - Caller-provided `libraryOptions.Auth` → take precedence (no defaults).
 * - Otherwise → refresh the singleton token provider's auth config + storage
 *   and inject the singleton token/credentials providers.
 */
function resolveLibraryOptions(
	resourceConfig: ResourcesConfig,
	libraryOptions?: LibraryOptions,
	previousLibraryOptions?: LibraryOptions,
): LibraryOptions {
	// If no new libraryOptions were provided, preserve the previously configured
	// ones (the core AmplifyClass singleton used to perform this merge).
	if (!libraryOptions && previousLibraryOptions) {
		return previousLibraryOptions;
	}

	if (!resourceConfig.Auth) {
		return libraryOptions ?? {};
	}

	if (libraryOptions?.Auth) {
		return libraryOptions;
	}

	const cookieBasedKeyValueStorage = new CookieStorage({ sameSite: 'lax' });
	const resolvedKeyValueStorage = libraryOptions?.ssr
		? cookieBasedKeyValueStorage
		: defaultStorage;
	const resolvedCredentialsProvider = libraryOptions?.ssr
		? new CognitoAWSCredentialsAndIdentityIdProvider(
				new DefaultIdentityIdStore(cookieBasedKeyValueStorage),
			)
		: cognitoCredentialsProvider;

	cognitoUserPoolsTokenProvider.setAuthConfig(resourceConfig.Auth);
	cognitoUserPoolsTokenProvider.setKeyValueStorage(
		// TODO: allow configure with a public interface
		resolvedKeyValueStorage,
	);

	return {
		...libraryOptions,
		Auth: {
			tokenProvider: cognitoUserPoolsTokenProvider,
			credentialsProvider: resolvedCredentialsProvider,
		},
	};
}
