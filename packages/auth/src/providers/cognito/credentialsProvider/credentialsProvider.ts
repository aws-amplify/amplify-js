// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { cognitoIdentityIdProvider } from './IdentityIdProvider';
import {
	AuthTokens,
	AWSCredentialsAndIdentityIdProvider,
	AWSCredentialsAndIdentityId,
	UserPoolConfigAndIdentityPoolConfig,
	getCredentialsForIdentity,
	GetCredentialsOptions,
	AuthConfig,
} from '@aws-amplify/core';
import { Logger } from '@aws-amplify/core/internals/utils';
import { AuthError } from '../../../errors/AuthError';
import { IdentityIdStore } from './types';

const logger = new Logger('CognitoCredentialsProvider');
const CREDENTIALS_TTL = 50 * 60 * 1000; // 50 min, can be modified on config if required in the future

export class CognitoAWSCredentialsAndIdentityIdProvider
	implements AWSCredentialsAndIdentityIdProvider
{
	constructor(identityIdStore: IdentityIdStore) {
		this._identityIdStore = identityIdStore;
	}

	private _authConfig?: AuthConfig;

	private _identityIdStore: IdentityIdStore;

	private _credentialsAndIdentityId?: AWSCredentialsAndIdentityId & {
		isAuthenticatedCreds: boolean;
	};
	private _nextCredentialsRefresh?: number;

	setAuthConfig(authConfig: AuthConfig) {
		this._authConfig = authConfig;
	}

	// TODO(V6): export clear crecentials to singleton
	async clearCredentialsAndIdentityId(): Promise<void> {
		logger.debug('Clearing out credentials and identityId');
		this._credentialsAndIdentityId = undefined;
		await this._identityIdStore.clearIdentityId();
	}

	async clearCredentials(): Promise<void> {
		logger.debug('Clearing out in-memory credentials');
		this._credentialsAndIdentityId = undefined;
	}

	async getCredentialsAndIdentityId(
		getCredentialsOptions: GetCredentialsOptions
	): Promise<AWSCredentialsAndIdentityId> {
		const isAuthenticated = getCredentialsOptions.authenticated;
		const tokens = getCredentialsOptions.tokens;
		// TODO: refactor use the this._authConfig
		const authConfig =
			getCredentialsOptions.authConfig as UserPoolConfigAndIdentityPoolConfig;
		const forceRefresh = getCredentialsOptions.forceRefresh;
		// TODO(V6): Listen to changes to AuthTokens and update the credentials
		const identityId = await cognitoIdentityIdProvider({
			tokens,
			authConfig,
			identityIdStore: this._identityIdStore,
		});
		if (!identityId) {
			throw new AuthError({
				name: 'IdentityIdConfigException',
				message: 'No Cognito Identity Id provided',
				recoverySuggestion: 'Make sure to pass a valid identityId.',
			});
		}

		if (forceRefresh) {
			this.clearCredentials();
		}

		if (!isAuthenticated) {
			return await this.getGuestCredentials(identityId, authConfig);
		} else {
			// Tokens will always be present if getCredentialsOptions.authenticated is true as dictated by the type
			return await this.credsForOIDCTokens(authConfig, tokens!, identityId);
		}
	}

	private async getGuestCredentials(
		identityId: string,
		authConfig: UserPoolConfigAndIdentityPoolConfig
	): Promise<AWSCredentialsAndIdentityId> {
		if (
			this._credentialsAndIdentityId &&
			!this.isPastTTL() &&
			this._credentialsAndIdentityId.isAuthenticatedCreds === false
		) {
			logger.info(
				'returning stored credentials as they neither past TTL nor expired'
			);
			return this._credentialsAndIdentityId;
		}

		// Clear to discard if any authenticated credentials are set and start with a clean slate
		this.clearCredentials();

		// use identityId to obtain guest credentials
		// save credentials in-memory
		// No logins params should be passed for guest creds:
		// https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_GetCredentialsForIdentity.html

		const region = authConfig.Cognito.identityPoolId.split(':')[0];

		// TODO(V6): When unauth role is disabled and crdentials are absent, we need to return null not throw an error
		const clientResult = await getCredentialsForIdentity(
			{ region },
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
				identityId,
			};
			const identityIdRes = clientResult.IdentityId;
			if (identityIdRes) {
				res.identityId = identityIdRes;
				this._identityIdStore.storeIdentityId({
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
			!this.isPastTTL() &&
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
		const logins = authTokens.idToken
			? formLoginsMap(
					authTokens.idToken.toString(),
					'COGNITO',
					this._authConfig
			  )
			: {};
		const identityPoolId = authConfig.Cognito.identityPoolId;
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
			{ region },
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
				identityId,
			};
			// Store the credentials in-memory along with the expiration
			this._credentialsAndIdentityId = {
				...res,
				isAuthenticatedCreds: true,
			};
			const identityIdRes = clientResult.IdentityId;
			if (identityIdRes) {
				res.identityId = identityIdRes;
				this._identityIdStore.storeIdentityId({
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

	// TODO(V6): Make sure this check is not needed, it is present in v5
	// private _isExpired(credentials: Credentials): boolean {
	// 	const ts = Date.now();

	// 	/* returns date object.
	// 		https://github.com/aws/aws-sdk-js-v3/blob/v1.0.0-beta.1/packages/types/src/credentials.ts#L26
	// 	*/
	// 	const { expiration } = credentials;
	// 	// TODO(V6): when  there is no expiration should we consider it not expired?
	// 	if (!expiration) return false;
	// 	const expDate = new Date(Number.parseInt(expiration.toString()) * 1000);
	// 	const isExp = expDate.getTime() <= ts;
	// 	logger.debug('are the credentials expired?', isExp);
	// 	return isExp;
	// }

	private isPastTTL(): boolean {
		return this._nextCredentialsRefresh === undefined
			? true
			: this._nextCredentialsRefresh <= Date.now();
	}
}

export function formLoginsMap(
	idToken: string,
	oidcProvider: string,
	authConfig?: AuthConfig
) {
	const userPoolId = authConfig?.Cognito.userPoolId;
	const res: Record<string, string> = {};
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
		// TODO(V6): Support custom OIDC providers
		throw new AuthError({
			name: 'AuthConfigException',
			message: 'OIDC provider not supported',
			recoverySuggestion:
				'Currently only COGNITO as OIDC provider is supported',
		});
	}
	res[domainName] = idToken;
	return res;
}
