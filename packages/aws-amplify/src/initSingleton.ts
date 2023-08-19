// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	LibraryOptions,
	ResourcesConfig,
	AmplifyV6,
	LocalStorage,
	CookieStorage,
} from '@aws-amplify/core';
import {
	CognitoUserPoolsTokenProvider,
	cognitoCredentialsProvider,
} from './auth';

export const DefaultAmplifyV6 = {
	configure(resourceConfig: ResourcesConfig, libraryOptions?: LibraryOptions) {
		CognitoUserPoolsTokenProvider.setAuthConfig(resourceConfig.Auth);
		cognitoCredentialsProvider.setAuthConfig(resourceConfig.Auth);
		const defaultLibraryOptions: LibraryOptions = {
			Auth: {
				tokenProvider: CognitoUserPoolsTokenProvider,
				credentialsProvider: cognitoCredentialsProvider,
			},
		};

		let updatedLibraryOptions = {};

		if (libraryOptions !== undefined) {
			updatedLibraryOptions = libraryOptions;
		} else {
			CognitoUserPoolsTokenProvider.setKeyValueStorage(
				resourceConfig.ssr
					? new CookieStorage({
							sameSite: 'strict',
					  })
					: LocalStorage
			);
			updatedLibraryOptions = defaultLibraryOptions;
		}

		AmplifyV6.configure(resourceConfig, updatedLibraryOptions);
	},
	getConfig(): ResourcesConfig {
		return AmplifyV6.getConfig();
	},
};
