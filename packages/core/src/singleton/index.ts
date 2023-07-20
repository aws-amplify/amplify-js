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
import { Credentials } from '@aws-sdk/types';
import { DefaultAuthTokensOrchestrator, DefaultTokenStore } from './Auth';
import { MemoryKeyValueStorage } from '../StorageHelper';

let singletonResourcesConfig: ResourceConfig = {};

// TODO: add default AuthTokenStore for each platform
// TODO: add default providers for getting started
let singletonLibraryOptions: LibraryOptions = {
	Auth: {
		keyValueStorage: new MemoryKeyValueStorage(), // Initialize automatically Depends on platform,
		tokenRefresher: () => { throw new Error('No token refresher') },
	}
};

let authTokenStore: AuthTokenStore = new DefaultTokenStore();
let tokenOrchestrator: AuthTokenOrchestrator = new DefaultAuthTokensOrchestrator();
tokenOrchestrator.setAuthTokenStore(authTokenStore);

// add listeners of User changes
const observersList: Set<Observer<AuthSession>> = new Set();

export namespace Amplify {
	/**
	 * Configure Amplify Library with backend resources and library options
	 * @param resourcesConfig ResourceConfig
	 * @param libraryOptions LibraryOptions
	 */
	export function configure(
		resourcesConfig: ResourceConfig,
		libraryOptions?: LibraryOptions
	): void {
		// TODO: check if exists or not
		authTokenStore.setKeyValueStorage(singletonLibraryOptions.Auth.keyValueStorage);
		authTokenStore.setAuthConfig(resourcesConfig.Auth);

		tokenOrchestrator.setTokenRefresher(singletonLibraryOptions.Auth.tokenRefresher);

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
			let awsCreds: Credentials;
			let awsCredsIdentityId: string;

			try {
				tokens = await tokenOrchestrator.getTokens(
					{ options });

			} catch (error) {
				console.warn(error);
			}

			try {
				if (singletonLibraryOptions.Auth.identityIdProvider) {
					awsCredsIdentityId = await singletonLibraryOptions.Auth.identityIdProvider({ tokens, authConfig: singletonResourcesConfig.Auth });
				}
			} catch (err) {
				console.warn(err);
			}

			try {
				if (singletonLibraryOptions.Auth.credentialsProvider) {
					awsCreds = await singletonLibraryOptions.Auth.credentialsProvider({
						authConfig: singletonResourcesConfig.Auth,
						identityId: awsCredsIdentityId,
						tokens,
						options
					});
				}
			} catch (err) {
				 console.warn(err);
			}

			return {
				authenticated: tokens != undefined,
				tokens,
				awsCreds,
				awsCredsIdentityId
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
			await tokenOrchestrator.setTokens({ tokens });

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
			await tokenOrchestrator.clearTokens();

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
