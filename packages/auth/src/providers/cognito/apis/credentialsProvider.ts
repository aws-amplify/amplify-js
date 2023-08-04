// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { credentialsForIdentityIdClient } from '../utils/clients/CredentialsForIdentityIdClient';
import { Credentials } from '@aws-sdk/types';
import { setIdentityId } from './IdentityIdProvider';
import {
	Logger,
	AuthConfig,
	AuthTokens,
	CredentialsProvider,
	FetchAuthSessionOptions,
	AmplifyV6,
	UserPoolConfigAndIdentityPoolConfig,
	getCredentialsForIdentity,
} from '@aws-amplify/core';
import { AuthError } from '../../../errors/AuthError';

const logger = new Logger('CognitoCredentialsProvider');
const CREDENTIALS_TTL = 50 * 60 * 1000; // 50 min, can be modified on config if required in the future

class CognitoCredentialsProvider implements CredentialsProvider {
	private _credentials?: Credentials & { isAuthenticatedCreds: boolean };
	private _nextCredentialsRefresh: number =
		new Date().getTime() + CREDENTIALS_TTL;
	// TODO(V6): find what needs to happen to locally stored identityId
	async clearCredentials(): Promise<void> {
		logger.debug('Clearing out credentials');
		this._credentials = undefined;
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
		// TODO(V6): Listen to changes to AuthTokens and update the credentials
		if (!identityId) {
			// TODO(V6): If there is no identityId attempt once to get it
			throw new AuthError({
				name: 'IdentityIdConfigException',
				message: 'No Cognito Identity Id provided',
				recoverySuggestion: 'Make sure to pass a valid identityId.',
			});
		}

		if (options?.forceRefresh) {
			if (AmplifyV6.libraryOptions.Auth?.tokenRefresher && tokens) {
				tokens = await AmplifyV6.libraryOptions.Auth?.tokenRefresher({
					tokens,
					authConfig,
				});
				this.clearCredentials();
			}
		}
		authConfig = AmplifyV6.getConfig()
			.Auth as UserPoolConfigAndIdentityPoolConfig;
		// check eligibility for guest credentials
		// - if there is error fetching tokens
		// - if user is not signed in
		// TODO(V6): Determine if tokens not being present is enough to decide we need to fetch guest credentials, do we need isSignedIn?
		if (!tokens) {
			// TODO(V6): Attempt to get the tokens from the provider once
			// tokens = await AmplifyV6.authTokensProvider.getAuthTokens();
			return await this.getGuestCredentials(identityId, authConfig);
		} else {
			return await this.credsForOIDCTokens(authConfig, tokens, identityId);
		}
	}

	private async getGuestCredentials(
		identityId: string,
		authConfig: UserPoolConfigAndIdentityPoolConfig
	): Promise<Credentials> {
		if (
			this._credentials &&
			!this._isExpired(this._credentials) &&
			!this._isPastTTL() &&
			this._credentials.isAuthenticatedCreds === false
		) {
			logger.info(
				'returning stored credentials as they neither past TTL nor expired'
			);
			return this._credentials;
		}

		// Clear to discard if any authenticated credentials are set and start with a clean slate
		this.clearCredentials();

		// TODO(V6): Access config to check for this value

		// Check if mandatory sign-in is enabled
		if (authConfig.isMandatorySignInEnabled) {
			throw new AuthError({
				name: 'AuthConfigException',
				message:
					'Cannot get guest credentials when mandatory signin is enabled',
				recoverySuggestion: 'Make sure mandatory signin is disabled.',
			});
		}

		// use identityId to obtain guest credentials
		// save credentials in-memory
		// No logins params should be passed for guest creds: https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_GetCredentialsForIdentity.html#API_GetCredentialsForIdentity_RequestSyntax

		const clientResult = await credentialsForIdentityIdClient({
			IdentityId: identityId,
		});
		if (
			clientResult.Credentials &&
			clientResult.Credentials.AccessKeyId &&
			clientResult.Credentials.SecretKey
		) {
			// TODO(V6): The values in this type is non optional but we get optional values from client
			const res: Credentials = {
				accessKeyId: clientResult.Credentials.AccessKeyId,
				secretAccessKey: clientResult.Credentials.SecretKey,
				sessionToken: clientResult.Credentials.SessionToken,
				expiration: clientResult.Credentials.Expiration,
			};
			const identityIdRes = clientResult.IdentityId;
			if (identityIdRes) {
				setIdentityId({
					id: identityIdRes,
					type: 'guest',
				});
			}
			this._credentials = {
				...res,
				isAuthenticatedCreds: false,
			};
			return res;
		} else {
			throw new AuthError({
				name: 'CredentialsException',
				message: `Error getting credentials.`,
			});
		}
	}

	private async credsForOIDCTokens(
		authConfig: UserPoolConfigAndIdentityPoolConfig,
		authTokens: AuthTokens,
		identityId?: string
	): Promise<Credentials> {
		if (
			this._credentials &&
			!this._isExpired(this._credentials) &&
			!this._isPastTTL() &&
			this._credentials.isAuthenticatedCreds === true
		) {
			logger.debug(
				'returning stored credentials as they neither past TTL nor expired'
			);
			return this._credentials;
		}

		// Clear to discard if any unauthenticated credentials are set and start with a clean slate
		this.clearCredentials();

		// TODO(V6): oidcProvider should come from config, TBD
		let logins = authTokens.idToken
			? formLoginsMap(authTokens.idToken.toString(), 'COGNITO')
			: {};
		const identityPoolId = authConfig.identityPoolId;
		if (!identityPoolId) {
			logger.debug('identityPoolId is not found in the config');
			throw new AuthError({
				name: 'AuthConfigException',
				message: 'Cannot get credentials without an identityPoolId',
				recoverySuggestion:
					'Make sure a valid identityPoolId is given in the config.',
			});
		}
		const region = identityPoolId.split(':')[0];
		// TODO(V6): Replace with existing identityPoolClient
		const clientResult = await credentialsForIdentityIdClient({
			IdentityId: identityId,
			Logins: logins,
		});

		if (
			clientResult.Credentials &&
			clientResult.Credentials.AccessKeyId &&
			clientResult.Credentials.SecretKey
		) {
			// TODO(V6): The values in this Credentials type is non optional but we get optional values from client
			const res: Credentials = {
				accessKeyId: clientResult.Credentials.AccessKeyId ?? '',
				secretAccessKey: clientResult.Credentials.SecretKey ?? '',
				sessionToken: clientResult.Credentials.SessionToken,
				// TODO(V6): Fixed expiration now + 50 mins
				expiration: clientResult.Credentials.Expiration,
			};
			// Store the credentials in-memory along with the expiration
			this._credentials = {
				...res,
				isAuthenticatedCreds: true,
			};
			const identityIdRes = clientResult.IdentityId;
			if (identityIdRes) {
				setIdentityId({
					id: identityIdRes,
					type: 'primary',
				});
			}
			return res;
		} else {
			throw new AuthError({
				name: 'CredentialsException',
				message: `Error getting credentials.`,
			});
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
		const expDate = new Date(Number.parseInt(expiration.toString()) * 1000);
		const isExp = expDate.getTime() <= ts;
		logger.debug('are the credentials expired?', isExp);
		return isExp;
	}

	private _isPastTTL(): boolean {
		return this._nextCredentialsRefresh <= Date.now();
	}
}

export function formLoginsMap(idToken: string, oidcProvider: string) {
	// TODO(V6): Update with Amplify.config values

	const authConfig = AmplifyV6.getConfig().Auth;
	const userPoolId = authConfig?.userPoolId;
	if (!userPoolId) {
		logger.debug('userPoolId is not found in the config');
		throw new AuthError({
			name: 'AuthConfigException',
			message: 'Cannot get credentials without an userPoolId',
			recoverySuggestion:
				'Make sure a valid userPoolId is given in the config.',
		});
	}

	const region = userPoolId.split('_')[0];
	// TODO(V6): see why we need identityPoolRegion check here
	if (!region) {
		logger.debug('region is not configured for getting the credentials');
		throw new AuthError({
			name: 'AuthConfigException',
			message: 'Cannot get credentials without a region',
			recoverySuggestion: 'Make sure a valid region is given in the config.',
		});
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

/**
 * Cognito specific implmentation of the CredentialsProvider interface
 * that manages setting and getting of AWS Credentials.
 *
 * @throws internal: {@link AuthError }
 *  - Auth errors that may arise from misconfiguration.
 *
 * TODO(V6): convert the Auth errors to config errors
 */
export const cognitoCredentialsProvider = new CognitoCredentialsProvider();
