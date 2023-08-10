import {
	LibraryOptions,
	ResourcesConfig,
	AmplifyV6,
	LocalStorage,
} from '@aws-amplify/core';
import {
	CognitoUserPoolsTokenProvider,
	cognitoCredentialsProvider,
} from './auth';

export const DefaultAmplifyV6 = {
	configure(resourceConfig: ResourcesConfig, libraryOptions?: LibraryOptions) {
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
			CognitoUserPoolsTokenProvider.setKeyValueStorage(LocalStorage);
			updatedLibraryOptions = defaultLibraryOptions;
		}

		AmplifyV6.configure(resourceConfig, updatedLibraryOptions);
	},
	getConfig(): ResourcesConfig {
		return AmplifyV6.getConfig();
	},
};
