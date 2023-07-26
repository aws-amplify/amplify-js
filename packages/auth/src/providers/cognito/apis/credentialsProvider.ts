// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { credentialsForIdentityIdClient } from '../utils/clients/CredentialsForIdentityIdClient';
// TODO(V6): Confirm use of this type from the sdk is necessary
import { Credentials } from '@aws-sdk/types';
import { setIdentityId } from './IdentityIdProvider';
import {
	Logger,
	AuthConfig,
	AuthTokens,
	CredentialsProvider,
	FetchAuthSessionOptions,
	AuthCredentialStore,
	DefaultCredentialStore,
	AmplifyV6,
	MemoryKeyValueStorage,
} from '@aws-amplify/core';

const logger = new Logger('CredentialsProvider');
const CREDENTIALS_TTL = 50 * 60 * 1000; // 50 min, can be modified on config if required in the future

class CognitoCredentialsProvider implements CredentialsProvider {
	// TODO(V6): find what needs to happen to locally stored identityId
	async clearCredentials(): Promise<void> {
		logger.debug('Clearing out credentials');
		await this._credentialsStore.clearCredentials();
	}
	private _nextCredentialsRefresh: number =
		new Date().getTime() + CREDENTIALS_TTL;
	private _credentialsStore: AuthCredentialStore;
	constructor() {
		this._credentialsStore = new DefaultCredentialStore();
		// Initialize the storage with what's given during config or create a new instance
		if (AmplifyV6.libraryOptions.Auth?.keyValueStorage) {
			this._credentialsStore.setKeyValueStorage(
				AmplifyV6.libraryOptions.Auth?.keyValueStorage
			);
		} else {
			this._credentialsStore.setKeyValueStorage(new MemoryKeyValueStorage());
		}
	}
	async getCredentials({
		options,
		tokens,
		authConfig,
		identityId,
	}: {
		options?: FetchAuthSessionOptions;
		tokens?: AuthTokens;
		authConfig?: AuthConfig;
		identityId?: string;
	}): Promise<Credentials> {
		try {
			// TODO(V6): If there is no identityId attempt once to get it
			if (authConfig) this._credentialsStore.setAuthConfig(authConfig);
			if (options?.forceRefresh) {
				if (AmplifyV6.libraryOptions.Auth?.tokenRefresher && tokens) {
					tokens = await AmplifyV6.libraryOptions.Auth?.tokenRefresher({
						tokens,
						authConfig,
					});
					this.clearCredentials();
				}
			}
			// check eligibility for guest credentials
			// - if there is error fetching tokens
			// - if user is not signed in
			// TODO(V6): Determine if tokens not being present is enough to decide we need to fetch guest credentials, do we need isSignedIn?
			if (!tokens) {
				// TODO(V6): Attempt to get the tokens from the provider once
				// tokens = await AmplifyV6.authTokensProvider.getAuthTokens();
				return await this.getGuestCredentials(identityId);
			} else {
				return await this.credsForOIDCTokens(tokens, identityId);
			}
		} catch (e) {
			// return guest credentials if there is any error fetching the auth tokens
			return await this.getGuestCredentials();
		}
	}

	private async getGuestCredentials(identityId?: string): Promise<Credentials> {
		const credentials = await this._credentialsStore.loadCredentials();

		if (
			credentials &&
			!this._isExpired(credentials) &&
			!this._isPastTTL() &&
			// TODO(V6): How to know the locally stored credentials is guest or authenticated?
			credentials.isAuthenticatedCreds === true
		) {
			logger.info(
				'returning stored credentials as they neither past TTL nor expired'
			);
			return credentials;
		}

		// Clear to discard if any authenticated credentials are set and start with a clean slate
		this.clearCredentials();

		// TODO(V6): Access config to check for this value
		const amplifyConfig = { isMandatorySignInEnabled: false };
		const { isMandatorySignInEnabled } = amplifyConfig;

		// Check if mandatory sign-in is enabled
		if (isMandatorySignInEnabled) {
			throw Error(
				'Cannot get guest credentials when mandatory signin is enabled'
			);
		}

		// use identityId to obtain guest credentials
		// save credentials in-memory
		// No logins params should be passed for guest creds: https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_GetCredentialsForIdentity.html#API_GetCredentialsForIdentity_RequestSyntax

		// TODO(V6): The API reference says identityId is required but the type can take undefined, why?
		const clientResult = await credentialsForIdentityIdClient({
			IdentityId: identityId,
		});
		if (clientResult.Credentials) {
			// TODO(V6): The values in this type is non optional but we get optional values from client
			const res: Credentials = {
				accessKeyId: clientResult.Credentials.AccessKeyId ?? '',
				secretAccessKey: clientResult.Credentials.SecretKey ?? '',
				sessionToken: clientResult.Credentials.SessionToken,
				expiration: clientResult.Credentials.Expiration,
			};
			let identityIdRes = clientResult.IdentityId;
			if (identityIdRes) {
				setIdentityId({
					id: identityIdRes,
					type: 'guest',
				});
			}
			this._credentialsStore.storeCredentials({
				...res,
				isAuthenticatedCreds: false,
			});
			return res;
		} else {
			throw Error('Unable to fetch credentials');
		}
	}

	private async credsForOIDCTokens(
		authTokens: AuthTokens,
		identityId?: string
	): Promise<Credentials> {
		const credentials = await this._credentialsStore.loadCredentials();

		if (
			credentials &&
			!this._isExpired(credentials) &&
			!this._isPastTTL() &&
			// TODO(V6): How to know the locally stored credentials is guest or authenticated?
			credentials.isAuthenticatedCreds === true
		) {
			logger.info(
				'returning stored credentials as they neither past TTL nor expired'
			);
			return credentials;
		}

		// Clear to discard if any unauthenticated credentials are set and start with a clean slate
		this.clearCredentials();

		// TODO(V6): make sure this is not a guest idenityId and is the one associated with the logins
		// let identityId = await getIdentityId(logins);

		// TODO(V6): oidcProvider should come from config, TBD
		let logins = authTokens.idToken
			? formLoginsMap(authTokens.idToken.toString(), 'COGNITO')
			: {};
		const clientResult = await credentialsForIdentityIdClient({
			IdentityId: identityId,
			Logins: logins,
		});

		if (clientResult.Credentials) {
			// TODO(V6): The values in this Credentials type is non optional but we get optional values from client
			const res: Credentials = {
				accessKeyId: clientResult.Credentials.AccessKeyId ?? '',
				secretAccessKey: clientResult.Credentials.SecretKey ?? '',
				sessionToken: clientResult.Credentials.SessionToken,
				expiration: clientResult.Credentials.Expiration,
			};
			// Store the credentials in-memory along with the expiration
			this._credentialsStore.storeCredentials({
				...res,
				isAuthenticatedCreds: true,
			});
			let identityIdRes = clientResult.IdentityId;
			if (identityIdRes) {
				setIdentityId({
					id: identityIdRes,
					type: 'primary',
				});
			}
			return res;
		} else {
			throw Error('Unable to fetch credentials');
		}
	}

	private _isExpired(credentials: Credentials): boolean {
		if (!credentials) {
			logger.debug('no credentials for expiration check');
			return true;
		}
		const ts = Date.now();

		/* returns date object.
			https://github.com/aws/aws-sdk-js-v3/blob/v1.0.0-beta.1/packages/types/src/credentials.ts#L26
		*/
		const { expiration } = credentials;
		// TODO(V6): when  there is no expiration should we consider it not expired?
		if (!expiration) return false;
		const isExp = expiration.getTime() <= ts;
		logger.debug('are the credentials expired?', isExp);
		return isExp;
	}

	private _isPastTTL(): boolean {
		return this._nextCredentialsRefresh <= Date.now();
	}
}

export function formLoginsMap(idToken: string, oidcProvider: string) {
	// TODO(V6): Update with Amplify.config values
	const amplifyConfig = {
		region: 'us-east-2',
		userPoolId: 'us-east-2_Q4ii7edTI',
	};
	const { region, userPoolId } = amplifyConfig;

	// TODO(V6): see why we need identityPoolRegion check here
	if (!region) {
		logger.debug('region is not configured for getting the credentials');
		throw Error('region is not configured for getting the credentials');
	}
	let domainName: string;
	if (oidcProvider === 'COGNITO') {
		domainName = 'cognito-idp.' + region + '.amazonaws.com/' + userPoolId;
	} else {
		// TODO(V6): Update this to have the actual value
		domainName = 'custom';
	}

	// TODO(V6): Make sure this takes idToken and not accessToken
	let res = {};
	res[domainName] = idToken;
	return res;
}

export const cognitoCredentialsProvider = new CognitoCredentialsProvider();
