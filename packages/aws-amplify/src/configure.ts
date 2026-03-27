// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
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
	CognitoAWSCredentialsAndIdentityIdProvider,
	DefaultIdentityIdStore,
	cognitoCredentialsProvider,
	cognitoUserPoolsTokenProvider,
} from './auth/cognito';

/**
 * Creates an {@link AmplifyContext} from the given resource configuration.
 * This is a pure function — it does not mutate any global state.
 *
 * @example
 * ```ts
 * import { configure } from 'aws-amplify';
 * import outputs from './amplify_outputs.json';
 *
 * const ctx = configure(outputs);
 * ```
 */
export function configure(
	resourceConfig: ResourcesConfig | LegacyConfig | AmplifyOutputsUnknown,
	libraryOptions?: LibraryOptions,
): AmplifyContext {
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
		fetchAuthSession: (options) => auth.fetchAuthSession(options ?? {}),
		clearCredentials: () => auth.clearCredentials(),
		getTokens: (options) => auth.getTokens(options),
	};

	return Object.freeze(ctx);
}

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
