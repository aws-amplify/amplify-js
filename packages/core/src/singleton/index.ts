import {
	AuthTokens,
	GetTokensOptions,
	LibraryOptions,
	ResourceConfig,
} from '../types';
import { Hub } from '../Hub';
import { Observable, Observer } from 'rxjs';
import { ICredentials } from '@aws-amplify/core';

let singletonResourcesConfig: ResourceConfig = {};
let singletonLibraryOptions: LibraryOptions = { Auth: {} };

// add listeners of User changes
const observersList: Set<Observer<AuthTokens>> = new Set();

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
		export async function fetchTokens(
			options?: GetTokensOptions
		): Promise<AuthTokens> {
			if (!singletonLibraryOptions?.Auth?.tokenProvider) {
				throw new Error('No token session provider configured'); // TODO: add default token provider
			}
			return await singletonLibraryOptions.Auth.tokenProvider.getTokens(options);
		}

		/**
		 * @private
			 * Internal use of Amplify only
		 * Obtain current Auth Tokens
		 * @param options GetTokensOptions
		 * @returns Promise<AuthTokens>
		 */
		export async function fetchCredentials(
			options?: GetTokensOptions
		): Promise<ICredentials> {
			if (!singletonLibraryOptions?.Auth?.credentialsProvider) {
				throw new Error('No credentials provider configured');
			}
			return await singletonLibraryOptions.Auth.credentialsProvider(options);
		}

		/**
		 * Obtain an Observable that notifies on session changes
		 * @returns Observable<AmplifyUserSession>
		 */
		export function listenSessionChanges(): Observable<AuthTokens> {
			return new Observable(observer => {
				observersList.add(observer);

				return () => {
					observersList.delete(observer);
				};
			});
		}

		/**
		 * @private
			 * Internal use of Amplify only
		 * Persist Auth Tokens
		 * @param tokens AuthTokens
		 * @returns Promise<void>
		 */
		export function setTokens(tokens: AuthTokens): Promise<void> {
			// TODO: Save tokens to Auth Storage

			// Notify observers
			for (const observer of observersList) {
				observer.next(tokens);
			}

			return;
		}

		/**
		 * @private
			 * Internal use of Amplify only
		 * Persist Auth Tokens
		 * @param tokens AuthTokens
		 * @returns Promise<void>
		 */
		export function getTokens(): Promise<AuthTokens> {
			// TODO: Read tokens from Auth Storage

			return;
		}
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
