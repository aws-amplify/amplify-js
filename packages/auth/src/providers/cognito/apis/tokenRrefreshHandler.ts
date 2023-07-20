import { AuthTokens } from './tokensProvider';

export type RefreshMetaData = Record<string, string>;

export async function cognitoRefreshAuthTokensHandler(
	refreshMetaData: RefreshMetaData
): Promise<AuthTokens> {
	return Promise.resolve({
		idToken: '',
		accessToken: '',
		accessTokenExpiresAt: 30,
		oidcProvider: 'COGNITO',
		refreshMetaData: refreshMetaData,
		isSignedIn: true,
	});
}
