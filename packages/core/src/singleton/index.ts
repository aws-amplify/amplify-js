import { AuthClass } from './Auth';
import { Hub } from '../Hub';
import { LibraryOptions, ResourcesConfig } from './types';
import { AmplifyError } from '../Errors';
import { FetchAuthSessionOptions } from './Auth/types';

// TODO(v6): add default AuthTokenStore for each platform

class AmplifyClass {
	resourcesConfig: ResourcesConfig;
	libraryOptions: LibraryOptions;
	/**
	 * Cross-category Auth utilities.
	 *
	 * @internal
	 */
	public readonly Auth: AuthClass;
	constructor() {
		this.resourcesConfig = {};
		this.Auth = new AuthClass();

		// TODO(v6): add default providers for getting started
		this.libraryOptions = {
			Auth: {
				tokenProvider: {
					getTokens: () => {
						throw new AmplifyError({
							message: 'No tokenProvider provided',
							name: 'MissingTokenProvider',
							recoverySuggestion:
								'Make sure to call Amplify.configure in your app with a tokenProvider',
						});
					},
				},
			},
		};
	}

	/**
	 * Configures Amplify for use with your back-end resources.
	 *
	 * @remarks
	 * `configure` can be used to specify additional library options where available for supported categories.
	 *
	 * @param resourceConfig - Back-end resource configuration. Typically provided via the `aws-exports.js` file.
	 * @param libraryOptions - Additional options for customizing the behavior of the library.
	 */
	configure(
		resourcesConfig: ResourcesConfig,
		libraryOptions: LibraryOptions = {}
	): void {
		this.resourcesConfig = mergeResourceConfig(
			this.resourcesConfig,
			resourcesConfig
		);

		this.libraryOptions = mergeLibraryOptions(
			this.libraryOptions,
			libraryOptions
		);

		this.Auth.configure(this.resourcesConfig.Auth, this.libraryOptions.Auth);

		Hub.dispatch(
			'core',
			{
				event: 'configure',
				data: resourcesConfig,
			},
			'Configure'
		);
	}

	/**
	 * Provides access to the current back-end resource configuration for the Library.
	 *
	 * @returns Returns the current back-end resource configuration.
	 */
	getConfig(): ResourcesConfig {
		return JSON.parse(JSON.stringify(this.resourcesConfig));
	}
}

/**
 * The `Amplify` utility is used to configure the library.
 *
 * @remarks
 * `Amplify` is responsible for orchestrating cross-category communication within the library.
 */
export const AmplifyV6 = new AmplifyClass();

/**
 * Returns current session tokens and credentials
 *
 * @param options{FetchAuthSessionOptions} - Options for fetching session.
 *
 * @returns Returns a promise that will resolve with fresh authentication tokens.
 */
export const fetchAuthSession = (options: FetchAuthSessionOptions) => {
	return AmplifyV6.Auth.fetchAuthSession(options);
};

// TODO(v6): validate until which level this will nested, during Amplify.configure API review.
function mergeResourceConfig(
	existingConfig: ResourcesConfig,
	newConfig: ResourcesConfig
): ResourcesConfig {
	const resultConfig: ResourcesConfig = {};

	for (const category of Object.keys(existingConfig)) {
		resultConfig[category] = existingConfig[category];
	}

	for (const category of Object.keys(newConfig)) {
		resultConfig[category] = {
			...resultConfig[category],
			...newConfig[category],
		};
	}

	return resultConfig;
}

function mergeLibraryOptions(
	existingConfig: LibraryOptions,
	newConfig: LibraryOptions
): LibraryOptions {
	const resultConfig: LibraryOptions = {};

	for (const category of Object.keys(existingConfig)) {
		resultConfig[category] = existingConfig[category];
	}

	for (const category of Object.keys(newConfig)) {
		resultConfig[category] = {
			...resultConfig[category],
			...newConfig[category],
		};
	}

	return resultConfig;
}
