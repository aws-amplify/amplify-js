import {
	AuthSession,
	AuthTokenStore,
	AuthTokens,
	GetAuthTokensOptions,
	LibraryOptions,
	ResourceConfig,
	TokenRefresher,
} from '../types';
import { Hub } from '../Hub';
import { Observable, Observer } from 'rxjs';
import { DefaultAuthTokensOrchestrator, MyTokenStore } from './Auth';
import { MyStorage } from '../StorageHelper';

let singletonResourcesConfig: ResourceConfig = {};

// TODO: add default AuthTokenStore for each platform
let singletonLibraryOptions: LibraryOptions = {
	Auth: {
		authTokenStore: MyTokenStore, // constructs the keys and also has the migration for v5 tokens
		tokenOrchestrator: DefaultAuthTokensOrchestrator, // Combines refresher, with token store and keyValueStorage
		keyValueStore: MyStorage, // Depends on platform,
		tokenRefresher: async (authTokens: AuthTokens) => {
			throw new Error('No token refresher')
		}
	}
};

// add listeners of User changes
const observersList: Set<Observer<AuthSession>> = new Set();

export namespace Amplify {
	/**
	 * Configure Amplify Library with backend resources and library options
	 * @param resources ResourceConfig
	 * @param libraryOptions LibraryOptions
	 */
	export function configure(
		resourcesConfig: ResourceConfig,
		libraryOptions?: LibraryOptions
	): void {
		singletonResourcesConfig = incrementResourceConfig(singletonResourcesConfig, resourcesConfig);

		singletonLibraryOptions = incrementLibraryOptions(singletonLibraryOptions, libraryOptions);

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
	 * Obtain the backend resources the library is configured
	 * @returns ResourceConfig
	 */
	export function getConfig(): ResourceConfig {
		return JSON.parse(JSON.stringify(singletonResourcesConfig));
	}

	// TODO: Add more cross category functionality

	export namespace Auth {
		/**
		 * @private
			 * Internal use of Amplify only
		 * Obtain current Auth Tokens
		 * @param options GetTokensOptions
		 * @returns Promise<AuthTokens>
		 */
		export async function fetchAuthSession(
			options?: GetAuthTokensOptions
		): Promise<AuthSession> {
			if (!singletonLibraryOptions?.Auth?.tokenOrchestrator) {
				throw new Error('No token session provider configured'); // TODO: add default token provider
			}
			const tokens = await singletonLibraryOptions.Auth.tokenOrchestrator.getTokens({ tokenStore: singletonLibraryOptions.Auth.authTokenStore, keyValueStore: singletonLibraryOptions.Auth.keyValueStore, options });
			// const identityId = await
			return {
				authenticated: false,
				tokens
			}
		}

		/**
		 * Obtain an Observable that notifies on session changes
		 * @returns Observable<AmplifyUserSession>
		 */
		export function listenSessionChanges(): Observable<AuthSession> {
			return new Observable(observer => {
				observersList.add(observer);

				return () => {
					observersList.delete(observer);
				};
			});
		}

		/**
		 * @private
		 * Internal use of Amplify only, Persist Auth Tokens
		 * @param tokens AuthTokens
		 * @returns Promise<void>
		 */
		export async function setTokens(tokens: AuthTokens): Promise<void> {
			await singletonLibraryOptions.Auth.tokenOrchestrator.setTokens({ tokens, tokenStore: singletonLibraryOptions.Auth.authTokenStore, keyValueStore: singletonLibraryOptions.Auth.keyValueStore });

			// Notify observers
			for (const observer of observersList) {
				// TODO: Add load the identityId and credentials part
				observer.next({
					authenticated: true,
					tokens
				});
			}
			return;
		}

		/**
		 * @private
		 * Clear tokens
		 * @return Promise<void>
		 */
		export async function clearTokens(): Promise<void> {
			await singletonLibraryOptions.Auth.authTokenStore.clearTokens(singletonLibraryOptions.Auth.keyValueStore);
		}

		/**
		 * Internal use only by AuthTokenOrchestrator
		 */
		export const tokenRefresher: TokenRefresher = singletonLibraryOptions.Auth.tokenRefresher;

		/**
		 * @private
			  * Internal use of Amplify only
			* Get Storage adapter 
		 */
		export const authTokenStore: AuthTokenStore = singletonLibraryOptions.Auth.authTokenStore;

	}
}

function incrementResourceConfig(existingConfig: ResourceConfig, newConfig: ResourceConfig): ResourceConfig {
	const resultConfig: ResourceConfig = {};

	if (existingConfig) {
		for (const category of Object.keys(existingConfig)) {
			resultConfig[category] = existingConfig[category];
		}
	}

	if (newConfig) {
		for (const category of Object.keys(newConfig)) {
			resultConfig[category] = { ...resultConfig[category], ...newConfig[category] };
		}
	}

	return resultConfig;
}

function incrementLibraryOptions(existingConfig: LibraryOptions, newConfig: LibraryOptions): LibraryOptions {
	const resultConfig: LibraryOptions = {};

	if (existingConfig) {
		for (const category of Object.keys(existingConfig)) {
			resultConfig[category] = existingConfig[category];
		}
	}

	if (newConfig) {
		for (const category of Object.keys(newConfig)) {
			resultConfig[category] = { ...resultConfig[category], ...newConfig[category] };
		}
	}

	return resultConfig;
}
