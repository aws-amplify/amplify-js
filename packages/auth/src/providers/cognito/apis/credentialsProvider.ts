import { credentialsForIdentityIdClient } from '../utils/clients/CredentialsForIdentityIdClient';
import { Credentials } from '@aws-sdk/types';

// TODO(V6): Confirm use of this type from the sdk is necessary
// import { Amplify } from './MockAmplifySingleton';
import { Logger } from '@aws-amplify/core';
import {
	AuthConfig,
	AuthTokens,
	CredentialsProvider,
	FetchAuthSessionOptions,
} from '@aws-amplify/core/lib-esm/singleton/Auth/types';
import { setIdentityId } from './IdentityIdProvider';

const logger = new Logger('CredentialsProvider');
const CREDENTIALS_TTL = 50 * 60 * 1000; // 50 min, can be modified on config if required in the future

type AWSCredentialsWithExpiration = Credentials & {
	expiration?: Date;
};

class CognitoCredentialsProvider implements CredentialsProvider {
	// TODO(V6): find what needs to happen to locally stored identityId
	clearCredentials: () => Promise<void>;
	private _credentials?: AWSCredentialsWithExpiration;
	private _nextCredentialsRefresh: number =
		new Date().getTime() + CREDENTIALS_TTL;
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
			// check eligibility for guest credentials
			// - if there is error fetching tokens
			// - if user is not signed in
			// TODO(V6): Determine if tokens not being present is enough to decide we need to fetch guest credentials, do we need isSignedIn?
			if (!tokens) {
				// TODO(V6): Attempt to get the tokens from the provider once
				// tokens = await Amplify.authTokensProvider.getAuthTokens();
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
		// if (
		// 	this._credentials &&
		// 	!this._isExpired(this._credentials) &&
		// 	!this._isPastTTL()
		// 	TODO(V6): How to know the locally stored credentials is guest or authenticated?
		// 	&& this._credentials.authenticated === false
		// ) {
		// 	logger.debug('credentials not changed and not expired, directly return');
		// 	return this._credentials;
		// }

		// Clear to discard if any authenticated credentials are set and start with a clean slate
		this.clearCredentials();

		// TODO(V6): Access config to check for this value
		const amplifyConfig = { isMandatorySignInEnabled: false };
		const { isMandatorySignInEnabled } = amplifyConfig;

		// Check if mandatory sign-in is enabled
		if (isMandatorySignInEnabled) {
			return Promise.reject(
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
			};
			let identityIdRes = clientResult.IdentityId;
			if (identityIdRes) {
				setIdentityId({
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
		authTokens: AuthTokens,
		identityId?: string
	): Promise<Credentials> {
		// if (
		// 	this._credentials &&
		// 	!this._isExpired(this._credentials) &&
		// 	!this._isPastTTL()
		// 	TODO(V6): How to know the locally stored credentials is guest or authenticated?
		// 	&& this._credentials.authenticated === true
		// ) {
		// 	logger.debug('credentials not changed and not expired, directly return');
		// 	return this._credentials;
		// }

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
			// TODO(V6): The values in this type is non optional but we get optional values from client
			const res: Credentials = {
				accessKeyId: clientResult.Credentials.AccessKeyId ?? '',
				secretAccessKey: clientResult.Credentials.SecretKey ?? '',
				sessionToken: clientResult.Credentials.SessionToken,
			};
			// Store the credentials in-memory along with the expiration
			this._credentials = {
				...res,
				expiration: clientResult.Credentials.Expiration,
			};
			let identityIdRes = clientResult.IdentityId;
			if (identityIdRes) {
				setIdentityId({
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
		// TODO(V6)(V6): when  there is no expiration should we consider it not expired?
		if (!expiration) return true;
		return expiration.getTime() <= ts;
	}

	private _isPastTTL(): boolean {
		return this._nextCredentialsRefresh <= Date.now();
	}
}

export function formLoginsMap(idToken: string, oidcProvider: string) {
	const amplifyConfig = { region: 'region', userPoolId: '' };
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
	return {
		domainName: idToken,
	};
}

export const cognitoCredentialsProvider = new CognitoCredentialsProvider();
