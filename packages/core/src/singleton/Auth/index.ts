import { Observable, Observer } from 'rxjs';

import {
	AWSCredentialsAndIdentityId,
	AuthConfig,
	AuthSession,
	AuthTokens,
	FetchAuthSessionOptions,
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

export class AuthClass {
	private authSessionObservers: Set<Observer<AuthSession>>;
	private authConfig: AuthConfig;
	private authOptions: LibraryAuthOptions;

	constructor() {
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
		let credentialsAndIdentityId: AWSCredentialsAndIdentityId;

		try {
			tokens = await this.authOptions.tokenProvider?.getTokens(options);
		} catch (error) {
			// TODO(v6): validate error depending on conditions it can proceed or throw
		}

		try {
			if (this.authOptions.credentialsProvider) {
				credentialsAndIdentityId =
					await this.authOptions.credentialsProvider.getCredentialsAndIdentityId(
						{
							authConfig: this.authConfig,
							tokens,
							options,
						}
					);
			}
		} catch (err) {
			// TODO(v6): validate error depending on conditions it can proceed or throw
		}

		return {
			tokens,
			credentials: credentialsAndIdentityId?.credentials,
			identityId: credentialsAndIdentityId?.identityId,
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
}
