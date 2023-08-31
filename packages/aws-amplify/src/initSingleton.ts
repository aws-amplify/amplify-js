// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	LibraryOptions,
	ResourcesConfig,
	Amplify,
	LocalStorage,
	CookieStorage,
} from '@aws-amplify/core';
import {
	CognitoUserPoolsTokenProvider,
	cognitoCredentialsProvider,
} from './auth/cognito';

export const DefaultAmplify = {
	configure(resourceConfig: ResourcesConfig, libraryOptions?: LibraryOptions) {
		if (resourceConfig.Auth && !libraryOptions) {
			CognitoUserPoolsTokenProvider.setAuthConfig(resourceConfig.Auth);

			const defaultLibraryOptions: LibraryOptions = {
				Auth: {
					tokenProvider: CognitoUserPoolsTokenProvider,
					credentialsProvider: cognitoCredentialsProvider,
				},
			};

			CognitoUserPoolsTokenProvider.setKeyValueStorage(
				resourceConfig.ssr
					? new CookieStorage({
							sameSite: 'strict',
					})
					: LocalStorage
			);

			Amplify.configure(resourceConfig, defaultLibraryOptions);
		}
	},
	getConfig(): ResourcesConfig {
		return Amplify.getConfig();
	},
};
