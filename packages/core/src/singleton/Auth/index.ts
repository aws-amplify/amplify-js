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

	async fetchAuthSession(
		options: FetchAuthSessionOptions = {}
	): Promise<AuthSession> {
		let tokens: AuthTokens;
		let credentialsAndIdentityId: AWSCredentialsAndIdentityId;

		// Get tokens will throw if session cannot be refreshed (network or service error) or return null if not available
		tokens = await this.authOptions.tokenProvider?.getTokens(options);
		if (tokens) {
			// getCredentialsAndIdentityId will throw if cannot get credentials (network or service error)
			credentialsAndIdentityId =
				await this.authOptions.credentialsProvider?.getCredentialsAndIdentityId(
					{
						authConfig: this.authConfig,
						tokens,
						authenticated: true,
						forceRefresh: options.forceRefresh,
					}
				);
		} else {
			// getCredentialsAndIdentityId will throw if cannot get credentials (network or service error)
			credentialsAndIdentityId =
				await this.authOptions.credentialsProvider?.getCredentialsAndIdentityId(
					{
						authConfig: this.authConfig,
						authenticated: false,
						forceRefresh: options.forceRefresh,
					}
				);
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
