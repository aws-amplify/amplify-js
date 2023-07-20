import { getIdClient } from '../utils/clients/IdentityIdForPoolIdClient';
import { credentialsForIdentityIdClient } from '../utils/clients/CredentialsForIdentityIdClient';
import { AuthTokens, AuthTokensProvider } from './tokensProvider';

// TODO: Confirm use of this type from the sdk is necessary
import { Credentials } from '@aws-sdk/client-cognito-identity';
import { Amplify } from './MockAmplifySingleton';
import { CognitoIdentityIdProvider } from './IdentityIdProvider';
import { Logger, AuthCredentialsProvider } from '@aws-amplify/core';

const logger = new Logger('CredentialsProvider');
const CREDENTIALS_TTL = 50 * 60 * 1000; // 50 min, can be modified on config if required in the future

type AWSCredentialsWithExpiration = Credentials & {
	expiration?: Date;
};
export class CognitoCredentialsProvider implements AuthCredentialsProvider {
	clearCredentials: () => Promise<void>;
	private _credentials?: AWSCredentialsWithExpiration;
	private identityIdProvider = new CognitoIdentityIdProvider();
	private _nextCredentialsRefresh: number =
		new Date().getTime() + CREDENTIALS_TTL;
	async getCredentials(): Promise<Credentials> {
		try {
			// get auth tokens from the provider
			let oidcTokens = await Amplify.authTokensProvider.getAuthTokens();

			// check eligibility for guest credentials
			// - if there is error fetching tokens
			// - if user is not signed in
			// TODO: Determine if tokens not being present is enough to decide we need to fetch guest credentials, do we need isSignedIn?
			if (!oidcTokens || !oidcTokens.isSignedIn) {
				return await this.getGuestCredentials();
			} else {
				return await this.credsForOIDCTokens(oidcTokens);
			}
		} catch (e) {
			// return guest credentials if there is any error fetching the auth tokens
			return await this.getGuestCredentials();
		}
	}

	formDomainName(authProvider: AuthProvider) {
		switch (authProvider) {
			case 'GOOGLE':
				return 'www.google.com';
			default:
				return 'www.google.com';
		}
	}

	private async getGuestCredentials(): Promise<Credentials> {
		if (
			this._credentials &&
			!this._isExpired(this._credentials) &&
			!this._isPastTTL() &&
			this._credentials.authenticated === false
		) {
			logger.debug('credentials not changed and not expired, directly return');
			return this._credentials;
		}
		// TODO: Access config to check for this value
		const amplifyConfig = Amplify.config;
		const { isMandatorySignInEnabled } = amplifyConfig;

		// Check if mandatory sign-in is enabled
		if (isMandatorySignInEnabled) {
			return Promise.reject(
				'Cannot get guest credentials when mandatory signin is enabled'
			);
		}

		// TODO: make sure this is a guest identityId
		let identityId = await this.identityIdProvider.getIdentityId();

		// use identityId to obtain guest credentials
		// save credentials in-memory
		// No logins params should be passed for guest creds: https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_GetCredentialsForIdentity.html#API_GetCredentialsForIdentity_RequestSyntax
		// TODO: Provide params that include identityId and no logins (guest)
		const clientResult = await credentialsForIdentityIdClient({
			IdentityId: identityId.id,
		});
		if (clientResult.Credentials) {
			const res: AWSTemporaryCredentials = {
				accessKeyId: clientResult.Credentials.AccessKeyId,
				secretAccessKey: clientResult.Credentials.SecretKey,
				sessionToken: clientResult.Credentials.SessionToken,
				authenticated: false,
			};
			let identityIdRes = clientResult.IdentityId;
			if (identityIdRes) {
				this.identityIdProvider.setIdentityId({
					id: identityIdRes,
					type: 'guest',
				});
			}
			this._credentials = {
				...res,
				expiration: clientResult.Credentials.Expiration,
			};
			return res;
		} else {
			return Promise.reject('Unable to fetch credentials');
		}
	}

	private async credsForOIDCTokens(
		authTokens: AuthTokens
	): Promise<AWSTemporaryCredentials> {
		if (
			this._credentials &&
			!this._isExpired(this._credentials) &&
			!this._isPastTTL() &&
			this._credentials.authenticated === true
		) {
			logger.debug('credentials not changed and not expired, directly return');
			return this._credentials;
		}

		const idToken = authTokens.idToken;
		const amplifyConfig = Amplify.config;
		const { region, userPoolId } = amplifyConfig;

		// TODO: see why we need identityPoolRegion check here
		if (!region) {
			logger.debug('region is not configured for getting the credentials');
			return Promise.reject(
				'region is not configured for getting the credentials'
			);
		}

		let domainName: string;
		if (authTokens.oidcProvider === 'COGNITO') {
			domainName = 'cognito-idp.' + region + '.amazonaws.com/' + userPoolId;
		} else {
			domainName = authTokens.oidcProvider.custom;
		}
		const logins = {
			domainName: idToken,
		};

		// TODO: make sure this is not a guest idenityId and is the one associated with the logins
		let identityId = await this.identityIdProvider.getIdentityId(logins);

		const clientResult = await credentialsForIdentityIdClient({
			IdentityId: identityId.id,
			Logins: logins,
		});

		if (clientResult.Credentials) {
			const res: AWSTemporaryCredentials = {
				accessKeyId: clientResult.Credentials.AccessKeyId,
				secretAccessKey: clientResult.Credentials.SecretKey,
				sessionToken: clientResult.Credentials.SessionToken,
				authenticated: true,
			};
			// Store the credentials in-memory along with the expiration
			this._credentials = {
				...res,
				expiration: clientResult.Credentials.Expiration,
			};
			let identityIdRes = clientResult.IdentityId;
			if (identityIdRes) {
				this.identityIdProvider.setIdentityId({
					id: identityIdRes,
					type: 'primary',
				});
			}
			return res;
		} else {
			return Promise.reject('Unable to fetch credentials');
		}
	}

	private _isExpired(credentials: AWSCredentialsWithExpiration): boolean {
		if (!credentials) {
			logger.debug('no credentials for expiration check');
			return true;
		}
		logger.debug('are these credentials expired?', credentials);
		const ts = Date.now();

		/* returns date object.
			https://github.com/aws/aws-sdk-js-v3/blob/v1.0.0-beta.1/packages/types/src/credentials.ts#L26
		*/
		const { expiration } = credentials;
		return expiration.getTime() <= ts;
	}

	private _isPastTTL(): boolean {
		return this._nextCredentialsRefresh <= Date.now();
	}
}

type AuthProvider = 'AMAZON' | 'APPLE' | 'FACEBOOK' | 'GOOGLE' | 'TWITTER';
