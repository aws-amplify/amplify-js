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
	CognitoUserPoolsTokenProvider,
	cognitoCredentialsProvider,
} from './auth/cognito';

export const DefaultAmplify = {
	configure(resourceConfig: ResourcesConfig, libraryOptions?: LibraryOptions) {
		// When Auth config is provided but no custom Auth provider defined
		// use the default Auth Providers
		if (resourceConfig.Auth && !libraryOptions?.Auth) {
			CognitoUserPoolsTokenProvider.setAuthConfig(resourceConfig.Auth);

			const libraryOptionsWithDefaultAuthProviders: LibraryOptions = {
				...libraryOptions,
				Auth: {
					tokenProvider: CognitoUserPoolsTokenProvider,
					credentialsProvider: cognitoCredentialsProvider,
				},
			};

			CognitoUserPoolsTokenProvider.setKeyValueStorage(
				libraryOptions?.ssr
					? new CookieStorage({
							sameSite: 'strict',
					  })
					: defaultStorage
			);

			Amplify.configure(resourceConfig, libraryOptionsWithDefaultAuthProviders);
		} else {
			Amplify.configure(resourceConfig, libraryOptions);
		}
	},
	getConfig(): ResourcesConfig {
		return Amplify.getConfig();
	},
};
