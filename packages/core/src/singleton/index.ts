import { Auth } from './Auth';
import { Hub } from '../Hub';
import { MemoryKeyValueStorage } from '../StorageHelper';
import { LibraryOptions, ResourcesConfig } from './types';
import { AmplifyError } from '../Errors';

// TODO(v6): add default AuthTokenStore for each platform

class AmplifyClass {
	resourcesConfig: ResourcesConfig;
	libraryOptions: LibraryOptions;
	/**
	 * Cross-category Auth utilities.
	 *
	 * @internal
	 */
	public readonly Auth: Auth;
	constructor() {
		this.resourcesConfig = {};
		this.Auth = new Auth();

		// TODO(v6): add default providers for getting started
		this.libraryOptions = {
			Auth: {
				keyValueStorage: new MemoryKeyValueStorage(), // Initialize automatically Depending on platform,
				tokenRefresher: () => {
					throw new AmplifyError({
						message: 'No tokenRefresher not provided',
						name: 'MissingTokenRefresher',
						recoverySuggestion:
							'Make sure to call Amplify.configure in your app with a tokenRefresher',
					});
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
export const Amplify = new AmplifyClass();

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
