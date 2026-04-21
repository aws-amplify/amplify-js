// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AMPLIFY_CONTEXT_BRAND,
	AmplifyContext,
	AuthSession,
	AuthTokens,
	CookieStorage,
	FetchAuthSessionOptions,
	Hub,
	LibraryOptions,
	ResourcesConfig,
	defaultStorage,
	getGlobalContext,
} from '@aws-amplify/core';
import {
	AMPLIFY_SYMBOL,
	AmplifyOutputsUnknown,
	AuthClass,
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
 * The `Amplify` namespace provides v6-compatible convenience methods that
 * delegate to the global {@link AmplifyContext}.
 *
 * @example
 * ```ts
 * import { Amplify } from 'aws-amplify';
 * import outputs from './amplify_outputs.json';
 *
 * Amplify.configure(outputs);
 * ```
 */
export const Amplify = {
	/**
	 * Configures Amplify globally. Sets the global context so that category
	 * APIs can be called without passing a context explicitly.
	 *
	 * @remarks
	 * This API does not perform any merging of either `resourcesConfig` or
	 * `libraryOptions`. The most recently provided values will be used.
	 */
	configure(
		resourceConfig: ResourcesConfig | LegacyConfig | AmplifyOutputsUnknown,
		libraryOptions?: LibraryOptions,
	): void {
		const resolvedResourceConfig = parseAmplifyConfig(resourceConfig);
		const resolvedLibraryOptions = resolveLibraryOptions(
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
			fetchAuthSession: fetchOptions =>
				auth.fetchAuthSession(fetchOptions ?? {}),
			clearCredentials: () => auth.clearCredentials(),
			getTokens: tokenOptions => auth.getTokens(tokenOptions),
		};

		Object.defineProperty(ctx, AMPLIFY_CONTEXT_BRAND, {
			value: true,
			enumerable: false,
			configurable: false,
			writable: false,
		});

		Object.freeze(ctx);
		setGlobalContext(ctx);

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
	 * Returns the resource configuration from the global context.
	 *
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

function resolveLibraryOptions(
	resourceConfig: ResourcesConfig,
	libraryOptions?: LibraryOptions,
): LibraryOptions {
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
	cognitoUserPoolsTokenProvider.setKeyValueStorage(resolvedKeyValueStorage);

	return {
		...libraryOptions,
		Auth: {
			tokenProvider: cognitoUserPoolsTokenProvider,
			credentialsProvider: resolvedCredentialsProvider,
		},
	};
}
