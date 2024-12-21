// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AuthConfig,
	AuthSession,
	AuthTokens,
	CredentialsAndIdentityId,
	FetchAuthSessionOptions,
	LibraryAuthOptions,
} from './types';

export class AuthClass {
	private authConfig?: AuthConfig;
	private authOptions?: LibraryAuthOptions;

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
		authOptions?: LibraryAuthOptions,
	): void {
		this.authConfig = authResourcesConfig;
		this.authOptions = authOptions;
	}

	/**
	 * Fetch the auth tokens, and the temporary AWS credentials and identity if they are configured. By default it
	 * does not refresh the auth tokens or credentials if they are loaded in storage already. You can force a refresh
	 * with `{ forceRefresh: true }` input.
	 *
	 * @param options - Options configuring the fetch behavior.
	 *
	 * @returns Promise of current auth session {@link AuthSession}.
	 */
	async fetchAuthSession(
		options: FetchAuthSessionOptions = {},
	): Promise<AuthSession> {
		let credentialsAndIdentityId: CredentialsAndIdentityId | undefined;
		let userSub: string | undefined;

		// Get tokens will throw if session cannot be refreshed (network or service error) or return null if not available
		const tokens = await this.getTokens(options);

		if (tokens) {
			userSub = tokens.accessToken?.payload?.sub;

			// getCredentialsAndIdentityId will throw if cannot get credentials (network or service error)
			credentialsAndIdentityId =
				await this.authOptions?.credentialsProvider?.getCredentialsAndIdentityId(
					{
						authConfig: this.authConfig,
						tokens,
						authenticated: true,
						forceRefresh: options.forceRefresh,
					},
				);
		} else {
			// getCredentialsAndIdentityId will throw if cannot get credentials (network or service error)
			credentialsAndIdentityId =
				await this.authOptions?.credentialsProvider?.getCredentialsAndIdentityId(
					{
						authConfig: this.authConfig,
						authenticated: false,
						forceRefresh: options.forceRefresh,
					},
				);
		}

		return {
			tokens,
			credentials: credentialsAndIdentityId?.credentials,
			identityId: credentialsAndIdentityId?.identityId,
			userSub,
		};
	}

	async clearCredentials(): Promise<void> {
		await this.authOptions?.credentialsProvider?.clearCredentialsAndIdentityId();
	}

	async getTokens(
		options: FetchAuthSessionOptions,
	): Promise<AuthTokens | undefined> {
		return (
			(await this.authOptions?.tokenProvider?.getTokens(options)) ?? undefined
		);
	}
}
