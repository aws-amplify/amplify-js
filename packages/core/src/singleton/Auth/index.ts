import { Buffer } from 'buffer'; // TODO: this needs to be a platform operation
import { Credentials } from '@aws-sdk/types';
import { Observable, Observer } from 'rxjs';

import { DefaultAuthTokensOrchestrator } from './TokenOrchestrator';
import { DefaultTokenStore } from './TokenStore';
import {
	AuthConfig,
	AuthSession,
	AuthTokenOrchestrator,
	AuthTokenStore,
	AuthTokens,
	FetchAuthSessionOptions,
	JWT,
	LibraryAuthOptions,
} from './types';

export function isTokenExpired({
	expiresAt,
	clockDrift,
}: {
	expiresAt: number;
	clockDrift: number;
}): boolean {
	const currentTime = Date.now();
	return currentTime + clockDrift > expiresAt;
}

export function decodeJWT(token: string): JWT {
	const tokenSplitted = token.split('.');
	if (tokenSplitted.length !== 3) {
		throw new Error('Invalid token');
	}

	const payloadString = tokenSplitted[1];
	const payload = JSON.parse(
		Buffer.from(payloadString, 'base64').toString('utf8')
	);

	try {
		return {
			toString: () => token,
			payload,
		};
	} catch (err) {
		throw new Error('Invalid token payload');
	}
}

export class Auth {
	private authTokenStore: AuthTokenStore;
	private tokenOrchestrator: AuthTokenOrchestrator;
	private authSessionObservers: Set<Observer<AuthSession>>;
	private authConfig: AuthConfig;
	private authOptions: LibraryAuthOptions;

	constructor() {
		this.authTokenStore = new DefaultTokenStore();
		this.tokenOrchestrator = new DefaultAuthTokensOrchestrator();
		this.tokenOrchestrator.setAuthTokenStore(this.authTokenStore);
		this.authSessionObservers = new Set();
	}

	/**
	 * Configure Auth category
	 *
	 * @internal
	 *
	 * @param authResourcesConfig - Resources configurations required by Auth providers.
	 * @param authOptions - Client options used by library
	 *
	 * @returns void
	 */
	configure(
		authResourcesConfig: AuthConfig,
		authOptions?: LibraryAuthOptions
	): void {
		this.authConfig = authResourcesConfig;
		this.authOptions = authOptions;

		this.authTokenStore.setKeyValueStorage(this.authOptions.keyValueStorage);
		this.authTokenStore.setAuthConfig(this.authConfig);

		this.tokenOrchestrator.setTokenRefresher(this.authOptions.tokenRefresher);
		this.tokenOrchestrator.setAuthConfig(this.authConfig);
	}

	/**
	 * Returns current session tokens and credentials
	 *
	 * @internal
	 *
	 * @param options - Options for fetching session.
	 *
	 * @returns Returns a promise that will resolve with fresh authentication tokens.
	 */
	async fetchAuthSession(
		options?: FetchAuthSessionOptions
	): Promise<AuthSession> {
		let tokens: AuthTokens;
		let awsCreds: Credentials;
		let awsCredsIdentityId: string;

		try {
			tokens = await this.tokenOrchestrator.getTokens({ options });
		} catch (error) {
			// TODO: validate error depending on conditions it can proceed or throw
		}

		try {
			if (this.authOptions.identityIdProvider) {
				awsCredsIdentityId = await this.authOptions.identityIdProvider({
					tokens,
					authConfig: this.authConfig,
				});
			}
		} catch (err) {
			// TODO: validate error depending on conditions it can proceed or throw
		}

		try {
			if (this.authOptions.credentialsProvider) {
				awsCreds = await this.authOptions.credentialsProvider({
					authConfig: this.authConfig,
					identityId: awsCredsIdentityId,
					tokens,
					options,
				});
			}
		} catch (err) {
			// TODO: validate error depending on conditions it can proceed or throw
		}

		return {
			authenticated: tokens !== undefined,
			tokens,
			awsCreds,
			awsCredsIdentityId,
		};
	}

	/**
	 * Obtain an Observable that notifies on session changes
	 *
	 * @returns Observable<AmplifyUserSession>
	 */
	listenSessionChanges(): Observable<AuthSession> {
		return new Observable(observer => {
			this.authSessionObservers.add(observer);

			return () => {
				this.authSessionObservers.delete(observer);
			};
		});
	}

	/**
	 * @internal
	 *
	 * Internal use of Amplify only, Persist Auth Tokens
	 *
	 * @param tokens AuthTokens
	 *
	 * @returns Promise<void>
	 */
	async setTokens(tokens: AuthTokens): Promise<void> {
		await this.tokenOrchestrator.setTokens({ tokens });

		// Notify observers (await is required to work with jest)
		for await (const observer of this.authSessionObservers) {
			// TODO: Add load the identityId and credentials part
			observer.next({
				authenticated: true,
				tokens,
			});
		}
		return;
	}

	/**
	 * @internal
	 *
	 * Clear tokens persisted on the client
	 *
	 * @return Promise<void>
	 */
	async clearTokens(): Promise<void> {
		await this.tokenOrchestrator.clearTokens();

		// Notify observers
		for await (const observer of this.authSessionObservers) {
			observer.next({
				authenticated: false,
			});
		}
		return;
	}
}
