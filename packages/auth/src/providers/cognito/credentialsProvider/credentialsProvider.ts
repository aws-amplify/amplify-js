// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Credentials } from '@aws-sdk/types';
import { cognitoIdentityIdProvider, setIdentityId } from './IdentityIdProvider';
import {
	Logger,
	AuthTokens,
	AmplifyV6,
	getCredentialsForIdentity,
	AWSCredentialsAndIdentityIdProvider,
	AWSCredentialsAndIdentityId,
	UserPoolConfigAndIdentityPoolConfig,
} from '@aws-amplify/core';
import { AuthError } from '../../../errors/AuthError';
import { GetCredentialsOptions } from '@aws-amplify/core';

const logger = new Logger('CognitoCredentialsProvider');
const CREDENTIALS_TTL = 50 * 60 * 1000; // 50 min, can be modified on config if required in the future

export class CognitoAWSCredentialsAndIdentityIdProvider
	implements AWSCredentialsAndIdentityIdProvider
{
	private _credentialsAndIdentityId?: AWSCredentialsAndIdentityId & {
		isAuthenticatedCreds: boolean;
	};
	private _nextCredentialsRefresh: number;
	// TODO(V6): find what needs to happen to locally stored identityId
	async clearCredentials(): Promise<void> {
		logger.debug('Clearing out credentials');
		this._credentialsAndIdentityId = undefined;
	}

	async getCredentialsAndIdentityId(
		getCredentialsOptions: GetCredentialsOptions
	): Promise<AWSCredentialsAndIdentityId> {
		const isAuthenticated = getCredentialsOptions.authenticated;
		let tokens = getCredentialsOptions.tokens;
		const authConfig =
			getCredentialsOptions.authConfig as UserPoolConfigAndIdentityPoolConfig;
		const forceRefresh = getCredentialsOptions.forceRefresh;
		// TODO(V6): Listen to changes to AuthTokens and update the credentials
		const identityId = await cognitoIdentityIdProvider({ tokens, authConfig });
		if (forceRefresh) {
			if (AmplifyV6.libraryOptions.Auth?.tokenProvider) {
				tokens = await AmplifyV6.libraryOptions.Auth?.tokenProvider.getTokens({
					forceRefresh: forceRefresh,
				});
				this.clearCredentials();
			}
		}

		// check eligibility for guest credentials
		// - if there is error fetching tokens
		// - if user is not signed in
		if (!isAuthenticated) {
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
	): Promise<AWSCredentialsAndIdentityId> {
		if (
			this._credentialsAndIdentityId &&
			!this._isExpired(this._credentialsAndIdentityId.credentials) &&
			!this._isPastTTL() &&
			this._credentialsAndIdentityId.isAuthenticatedCreds === false
		) {
			logger.info(
				'returning stored credentials as they neither past TTL nor expired'
			);
			return this._credentialsAndIdentityId;
		}

		// Clear to discard if any authenticated credentials are set and start with a clean slate
		this.clearCredentials();

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

		const region = authConfig.identityPoolId.split(':')[0];

		// TODO(V6): When unauth role is diabled and crdentials are absent, we need to return null not throw an error
		const clientResult = await getCredentialsForIdentity(
			{ region: region },
			{
				IdentityId: identityId,
			}
		);

		if (
			clientResult.Credentials &&
			clientResult.Credentials.AccessKeyId &&
			clientResult.Credentials.SecretKey
		) {
			this._nextCredentialsRefresh = new Date().getTime() + CREDENTIALS_TTL;
			const res: AWSCredentialsAndIdentityId = {
				credentials: {
					accessKeyId: clientResult.Credentials.AccessKeyId,
					secretAccessKey: clientResult.Credentials.SecretKey,
					sessionToken: clientResult.Credentials.SessionToken,
					expiration: clientResult.Credentials.Expiration,
				},
			};
			const identityIdRes = clientResult.IdentityId;
			if (identityIdRes) {
				res.identityId = identityIdRes;
				setIdentityId({
					id: identityIdRes,
					type: 'guest',
				});
			}
			this._credentialsAndIdentityId = {
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
	): Promise<AWSCredentialsAndIdentityId> {
		if (
			this._credentialsAndIdentityId &&
			!this._isExpired(this._credentialsAndIdentityId.credentials) &&
			!this._isPastTTL() &&
			this._credentialsAndIdentityId.isAuthenticatedCreds === true
		) {
			logger.debug(
				'returning stored credentials as they neither past TTL nor expired'
			);
			return this._credentialsAndIdentityId;
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
		const clientResult = await getCredentialsForIdentity(
			{ region: region },
			{
				IdentityId: identityId,
				Logins: logins,
			}
		);

		if (
			clientResult.Credentials &&
			clientResult.Credentials.AccessKeyId &&
			clientResult.Credentials.SecretKey
		) {
			const res: AWSCredentialsAndIdentityId = {
				credentials: {
					accessKeyId: clientResult.Credentials.AccessKeyId,
					secretAccessKey: clientResult.Credentials.SecretKey,
					sessionToken: clientResult.Credentials.SessionToken,
					// TODO(V6): Fixed expiration now + 50 mins
					expiration: clientResult.Credentials.Expiration,
				},
			};
			// Store the credentials in-memory along with the expiration
			this._credentialsAndIdentityId = {
				...res,
				isAuthenticatedCreds: true,
			};
			const identityIdRes = clientResult.IdentityId;
			if (identityIdRes) {
				res.identityId = identityIdRes;
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
		return this._nextCredentialsRefresh === undefined
			? true
			: this._nextCredentialsRefresh <= Date.now();
	}
}

export function formLoginsMap(idToken: string, oidcProvider: string) {
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
	if (!region) {
		logger.debug('region is not configured for getting the credentials');
		throw new AuthError({
			name: 'AuthConfigException',
			message: 'Cannot get credentials without a region',
			recoverySuggestion: 'Make sure a valid region is given in the config.',
		});
	}
	let domainName: string = '';
	if (oidcProvider === 'COGNITO') {
		domainName = 'cognito-idp.' + region + '.amazonaws.com/' + userPoolId;
	} else {
		// TODO: Support custom OIDC providers
		throw new AuthError({
			name: 'AuthConfigException',
			message: 'OIDC provider not supported',
			recoverySuggestion:
				'Currently only COGNITO as OIDC provider is supported',
		});
	}
	let res = {};
	res[domainName] = idToken;
	return res;
}
