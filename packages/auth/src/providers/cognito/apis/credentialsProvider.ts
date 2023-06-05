import { Logger } from '@aws-amplify/core';
import { identityIdForPoolIdClient } from '../utils/clients/IdentityIdForPoolIdClient';
import {
	AWSCognitoCredentials,
	credentialsForIdentityIdClient,
} from '../utils/clients/CredentialsForIdentityIdClient';
import { AuthTokensProvider } from './tokensProvider';
import {
	GetIdCommandOutput,
	GetIdCommandInput,
} from '@aws-sdk/client-cognito-identity';

const logger = new Logger('Credentials');

export type Success<T> = { value: T };
export type Failure<E> = { error: E };
export type Result<T, E> = Success<T> | Failure<E>;

export function isError<T, E>(
	result: Result<T, E> | undefined
): result is Failure<E> {
	return (result as Failure<E>) !== undefined;
}

export class CognitoCredentialsProvider {
	constructor(authTokensProvider?: AuthTokensProvider) {
		this.authTokensProvider = authTokensProvider;
	}
	authTokensProvider?: AuthTokensProvider;

	private credentials: AWSCognitoCredentials;
	private refreshCredentials: () => Promise<void>;

	async get(idpInfo?: IdpInfo): Promise<AWSCognitoCredentials> {
		// check if the cached credentials can be used

		// check eligibility for guest credentials
		var userpoolTokens = await this.authTokensProvider?.getAuthTokens();
		if (isError(userpoolTokens)) {
			userpoolTokens.error;
			return await this.getGuestCredentials();
		} else {
			userpoolTokens?.value;
		}

		throw new Error('Function not complete.');
	}

	private async getGuestCredentials(): Promise<AWSCognitoCredentials> {
		// post-check if mandatory sign-in is enabled or identityPoolId is not present

		// TODO: Access config to check for this value
		const isMandatorySignInEnabled: Boolean = false;
		if (isMandatorySignInEnabled) {
			return Promise.reject(
				'cannot get guest credentials when mandatory signin is enabled'
			);
		}

		// TODO: Access config to check for this value
		const isIdentityPoolIdPresent: Boolean = true;
		if (!isIdentityPoolIdPresent) {
			logger.debug(
				'No Cognito Identity pool provided for unauthenticated access'
			);
			return Promise.reject(
				'No Cognito Identity pool provided for unauthenticated access'
			);
		}

		// Check for region availablity that is needed for the client
		const isRegionAvailable: Boolean = true;
		if (!isRegionAvailable) {
			logger.debug('region is not configured for getting the credentials');
			return Promise.reject(
				'region is not configured for getting the credentials'
			);
		}

		// check if we have the identityId
		const isIdentityIdAvailable: Boolean = true;
		var IdentityId: string | undefined = '';
		if (!isIdentityIdAvailable) {
			// IdentityId is absent so get it using IdentityPoolId with Cognito's GetId API
			({ IdentityId } = await identityIdForPoolIdClient({
				IdentityPoolId: '',
			}));
		}

		// Cache IdentityId in-memory and in local storage

		// use identityId to obtain guest credentials
		// save credentials in-memory
		// TODO: Provide params that include region, identityId and no logins
		const credentials = (this.credentials = (
			await credentialsForIdentityIdClient({ identityId: '' })
		).credentials);
		return credentials;
	}
}

enum TokenSource {
	UserPool = 'USERPOOL',
	FederationCognito = 'FEDERATION.COGNITO',
	FederationGoogle = 'FEDERATION.GOOGLE',
	FederationFacebook = 'FEDERATION.FACEBOOK',
	FederationAmazon = 'FEDERATION.AMAZON',
	FederationApple = 'FEDERATION.APPLE',
}

type IdpInfo = {
	tokenSource: TokenSource;
	idToken: string;
	expires_at: Date;
	refreshHandler?: any; // TODO: figure out the type here
};
