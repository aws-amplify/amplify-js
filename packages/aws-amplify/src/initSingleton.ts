import { AmplifyV6 } from '@aws-amplify/core';
import { LibraryOptions, ResourcesConfig } from '@aws-amplify/core';
import { CognitoUserPoolsTokenProvider } from './auth';
import { LocalStorage } from '@aws-amplify/core'; // TODO(v6): use Platform storage supported

export const DefaultAmplifyV6 = {
	configure(resourceConfig: ResourcesConfig, libraryOptions?: LibraryOptions) {
		let defaultLibraryOptions: LibraryOptions = {
			Auth: {
				tokenProvider: CognitoUserPoolsTokenProvider,
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
