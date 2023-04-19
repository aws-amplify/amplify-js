import {
	AmplifyUserSession,
	LibraryOptions,
	GetUserSessionOptions,
	ResourceConfig,
} from './types';
import { Hub } from './Hub';
import { Observable } from 'rxjs';

let singletonResourcesConfig: ResourceConfig = {};
const singletonLibraryOptions: LibraryOptions = { Auth: {} };

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
		singletonResourcesConfig = resourcesConfig;
		if (libraryOptions?.Auth === null) {
			singletonLibraryOptions.Auth = {};
		} else if (libraryOptions?.Auth) {
			singletonLibraryOptions.Auth = libraryOptions.Auth;
		}

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
		 * Obtain current session
		 * @param options GetUserSessionOptions
		 * @returns Promise<AmplifyUserSession>
		 */
		export async function getUserSession(
			options?: GetUserSessionOptions
		): Promise<AmplifyUserSession> {
			if (!singletonLibraryOptions?.Auth?.sessionProvider) {
				throw new Error('No user session provider configured');
			}
			return await singletonLibraryOptions.Auth.sessionProvider.getUserSession({
				refresh: options?.refresh,
			});
		}
		/**
		 * Obtain an Observable that notifies session changes
		 * @returns Observable<AmplifyUserSession>
		 */
		export function listenUserSession(): Observable<AmplifyUserSession> {
			if (singletonLibraryOptions?.Auth?.sessionProvider?.listenUserSession) {
				return singletonLibraryOptions.Auth.sessionProvider.listenUserSession();
			} else {
				throw new Error('No user session provider configured');
			}
		}
	}
}
