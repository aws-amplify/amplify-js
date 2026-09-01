// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyContext,
	AuthSession,
	AuthTokens,
	FetchAuthSessionOptions,
	Hub,
	LibraryOptions,
	ResourcesConfig,
	createAmplifyContext,
	getGlobalContext,
	hasGlobalContext,
} from '@aws-amplify/core';
import {
	AMPLIFY_SYMBOL,
	AmplifyOutputsUnknown,
	LegacyConfig,
	parseAmplifyConfig,
	selectSsrKeyValueStorage,
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
	 * non-Auth `libraryOptions` are preserved (mirroring the previous singleton
	 * merge behavior); when provided they replace the previous ones. When
	 * `resourceConfig.Auth` is present and the caller does not supply
	 * `libraryOptions.Auth`, the default Cognito token/credentials providers are
	 * wired using cookie storage (`ssr: true`) or `localStorage` (default), and
	 * the singleton token provider's auth config is re-synced on every call so a
	 * reconfigure with a new `userPoolId` retargets token refresh.
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
 * - No `Auth` in the resource config → pass options through unchanged
 *   (preserving previously-resolved options when the caller supplies none).
 * - Caller-provided `libraryOptions.Auth` → take precedence (no defaults).
 * - Otherwise (Auth present, no caller-supplied Auth providers) → on **every**
 *   call, including reconfigures with or without other `libraryOptions`, refresh
 *   the singleton token provider's auth config + storage and inject the
 *   singleton token/credentials providers. Non-Auth library options are still
 *   carried forward from the previous configuration when the caller passes none.
 */
function resolveLibraryOptions(
	resourceConfig: ResourcesConfig,
	libraryOptions?: LibraryOptions,
	previousLibraryOptions?: LibraryOptions,
): LibraryOptions {
	// Pass-through: with no Auth in the resource config the singleton token
	// provider is never involved, so simply preserve the previously configured
	// libraryOptions when the caller supplies none (the core AmplifyClass
	// singleton used to perform this merge), otherwise use what was given.
	if (!resourceConfig.Auth) {
		if (!libraryOptions && previousLibraryOptions) {
			return previousLibraryOptions;
		}

		return libraryOptions ?? {};
	}

	// Caller-provided Auth providers always take precedence; never touch the
	// singleton token provider in that case.
	if (libraryOptions?.Auth) {
		return libraryOptions;
	}

	// Auth is present and the caller did NOT supply their own Auth providers.
	// Carry non-Auth library options forward from the previous configuration
	// when the caller passes none (Phase C preservation), but ALWAYS re-sync the
	// singleton token provider below so the Auth providers never go stale.
	const baseLibraryOptions = libraryOptions ?? previousLibraryOptions ?? {};

	// Select the storage backing the default providers via core's shared
	// helper (ssr → fresh cookie storage, else the localStorage-backed
	// singleton). When ssr is set, reuse the SAME cookie storage instance for
	// the identity-id store so tokens and identity ids share one cookie jar.
	const resolvedKeyValueStorage = selectSsrKeyValueStorage(
		baseLibraryOptions.ssr,
	);
	const resolvedCredentialsProvider = baseLibraryOptions.ssr
		? new CognitoAWSCredentialsAndIdentityIdProvider(
				new DefaultIdentityIdStore(resolvedKeyValueStorage),
			)
		: cognitoCredentialsProvider;

	// Re-push the resolved auth config + key-value storage into the process-wide
	// singleton token provider on EVERY configure call. AuthClass.getTokens
	// delegates to this provider's own authConfig, which is only ever updated
	// here; skipping this on a reconfigure (e.g. a new userPoolId with no
	// libraryOptions) would leave token refresh pinned to the previous pool
	// while getConfig()/credentials reflect the new one. Restores the #14819
	// contract.
	cognitoUserPoolsTokenProvider.setAuthConfig(resourceConfig.Auth);
	cognitoUserPoolsTokenProvider.setKeyValueStorage(
		// TODO: allow configure with a public interface
		resolvedKeyValueStorage,
	);

	return {
		...baseLibraryOptions,
		Auth: {
			tokenProvider: cognitoUserPoolsTokenProvider,
			credentialsProvider: resolvedCredentialsProvider,
		},
	};
}
