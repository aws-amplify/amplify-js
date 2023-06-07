import { Amplify } from '@aws-amplify/core';
import { identityIdForPoolIdClient } from '../utils/clients/IdentityIdForPoolIdClient';
import { credentialsForIdentityIdClient } from '../utils/clients/CredentialsForIdentityIdClient';
import { AuthTokensProvider } from './tokensProvider';

// TODO: Confirm use of this type from the sdk is necessary
import { Credentials } from '@aws-sdk/client-cognito-identity';

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

	private credentials?: Credentials;
	private refreshCredentials: () => Promise<void>;

	async get(idpInfo?: IdpInfo): Promise<Credentials | undefined> {
		// check if the cached credentials can be used

		// check eligibility for guest credentials
		var userpoolTokens = await this.authTokensProvider?.getAuthTokens();
		console.log('userpoolTokens: ', isError(userpoolTokens));

		if (isError(userpoolTokens)) {
			console.log('userpoolTokens.error: ', userpoolTokens.error.message);
			return await this.getGuestCredentials();
		} else {
			userpoolTokens?.value;
		}

		// throw new Error('Function not complete.');
	}

	private async getGuestCredentials(): Promise<Credentials | undefined> {
		// post-check if mandatory sign-in is enabled or identityPoolId is not present

		// const amplifyConfig = Amplify.config;

		// TODO: Access config to check for this value
		const isMandatorySignInEnabled: Boolean = false;
		if (isMandatorySignInEnabled) {
			return Promise.reject(
				'cannot get guest credentials when mandatory signin is enabled'
			);
		}
		const amplifyConfig = Amplify.config;
		console.log('amplifyConfig: ', amplifyConfig);

		// TODO: Access config to check for this value
		var identityPoolId: string | undefined;
		// console.log('identityPoolId: ', identityPoolId);

		// identityPoolId = amplifyConfig.identityPoolId;
		// console.log('identityPoolId: ', identityPoolId);
		// return Promise.resolve(undefined);
		identityPoolId = 'us-east-2:24f3f840-a3e1-4174-a1bc-8528fb7d4dd2';
		if (!identityPoolId) {
			console.log(
				'No Cognito Identity pool provided for unauthenticated access'
			);
			return Promise.reject(
				'No Cognito Identity pool provided for unauthenticated access'
			);
		}

		// Check for region availablity that is needed for the client
		var region: string | undefined;
		region = 'us-east-2';
		if (!region) {
			console.log('region is not configured for getting the credentials');
			return Promise.reject(
				'region is not configured for getting the credentials'
			);
		}

		// check if we have the identityId
		const isIdentityIdAvailable: Boolean = false;
		var IdentityId: string | undefined = '';
		if (!isIdentityIdAvailable) {
			console.log('Getting identityId');
			// IdentityId is absent so get it using IdentityPoolId with Cognito's GetId API
			({ IdentityId } = await identityIdForPoolIdClient({
				IdentityPoolId: identityPoolId,
			}));
		}

		// Cache IdentityId in-memory and in local storage

		// use identityId to obtain guest credentials
		// save credentials in-memory
		// TODO: Provide params that include region, identityId and no logins
		const credentials = (
			await credentialsForIdentityIdClient({ IdentityId: IdentityId })
		).Credentials;

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
