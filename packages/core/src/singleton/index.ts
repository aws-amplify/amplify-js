import {
	AuthSession,
	AuthTokenOrchestrator,
	AuthTokenStore,
	AuthTokens,
	GetAuthTokensOptions,
	LibraryOptions,
	ResourceConfig,
	TokenRefresher,
} from '../types';
import { Hub } from '../Hub';
import { Observable, Observer } from 'rxjs';
import { DefaultAuthTokensOrchestrator, DefaultTokenStore } from './Auth';
import { MyStorage } from '../StorageHelper';

let singletonResourcesConfig: ResourceConfig = {};

// TODO: add default AuthTokenStore for each platform
let singletonLibraryOptions: LibraryOptions = {
	Auth: {
		keyValueStore: MyStorage, // Depends on platform,
		tokenRefresher: async (authTokens: AuthTokens) => {
			throw new Error('No token refresher')
		}
	}
};

let authTokenStore: AuthTokenStore = DefaultTokenStore;
let tokenOrchestrator: AuthTokenOrchestrator = DefaultAuthTokensOrchestrator;

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
			let tokens: AuthTokens;
			try {
				tokens = await tokenOrchestrator.getTokens(
					{ tokenStore: authTokenStore, keyValueStore: singletonLibraryOptions.Auth.keyValueStore, options, tokenRefresher: singletonLibraryOptions.Auth.tokenRefresher });
				// const identityId = await

			} catch (error) {
				console.warn(error);
			}
			return {
				authenticated: tokens != undefined,
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
			await tokenOrchestrator.setTokens(
				{
					tokens, tokenStore: authTokenStore,
					keyValueStore: singletonLibraryOptions.Auth.keyValueStore
				}
			);

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
			await tokenOrchestrator.clearTokens({ keyValueStore: singletonLibraryOptions.Auth.keyValueStore, tokenStore: authTokenStore });
			
			// Notify observers
			for (const observer of observersList) {
				observer.next({
					authenticated: false,
				});
			}
			return;
		}

		/**
		 * Internal use only by AuthTokenOrchestrator
		 */
		export const tokenRefresher: TokenRefresher = singletonLibraryOptions.Auth.tokenRefresher;

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
