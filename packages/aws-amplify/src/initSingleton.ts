// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	Amplify,
	CookieStorage,
	LibraryOptions,
	ResourcesConfig,
	defaultStorage,
} from '@aws-amplify/core';
import {
	AmplifyOutputsUnknown,
	LegacyConfig,
	parseAmplifyConfig,
} from '@aws-amplify/core/internals/utils';

import {
	CognitoAWSCredentialsAndIdentityIdProvider,
	DefaultIdentityIdStore,
	cognitoCredentialsProvider,
	cognitoUserPoolsTokenProvider,
} from './auth/cognito';

export const DefaultAmplify = {
	/**
	 * Configures Amplify with the {@link resourceConfig} and {@link libraryOptions}.
	 *
	 * @param resourceConfig The {@link ResourcesConfig} object that is typically imported from the
	 * `amplifyconfiguration.json` file. It can also be an object literal created inline when calling `Amplify.configure`.
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
		const cookieBasedKeyValueStorage = new CookieStorage({ sameSite: 'lax' });
		const resolvedKeyValueStorage = libraryOptions?.ssr
			? cookieBasedKeyValueStorage
			: defaultStorage;
		const resolvedCredentialsProvider = libraryOptions?.ssr
			? new CognitoAWSCredentialsAndIdentityIdProvider(
					new DefaultIdentityIdStore(cookieBasedKeyValueStorage),
				)
			: cognitoCredentialsProvider;

		if (!resolvedResourceConfig.Auth || libraryOptions?.Auth) {
			Amplify.configure(resolvedResourceConfig, libraryOptions);

			return;
		}

		cognitoUserPoolsTokenProvider.setAuthConfig(resolvedResourceConfig.Auth);
		cognitoUserPoolsTokenProvider.setKeyValueStorage(
			// TODO: allow configure with a public interface
			resolvedKeyValueStorage,
		);

		Amplify.configure(resolvedResourceConfig, {
			...libraryOptions,
			Auth: {
				tokenProvider: cognitoUserPoolsTokenProvider,
				credentialsProvider: resolvedCredentialsProvider,
			},
		});
	},
	/**
	 * Returns the {@link ResourcesConfig} object passed in as the `resourceConfig` parameter when calling
	 * `Amplify.configure`.
	 *
	 * @returns An {@link ResourcesConfig} object.
	 */
	getConfig(): ResourcesConfig {
		return Amplify.getConfig();
	},
};
