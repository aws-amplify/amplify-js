import { Amplify, parseAWSExports } from '@aws-amplify/core';
import { requestCognitoUserPool } from '../client';
import { cacheTokens } from '../storage';

export async function signInWithUserPassword({ username, password }) {
	const amplifyConfig = parseAWSExports(Amplify.getConfig()) as any;
	if (amplifyConfig && amplifyConfig.Auth) {
		const clientId = amplifyConfig.Auth.userPoolWebClientId;
		const jsonReq = {
			ClientId: clientId,
			AuthFlow: 'USER_PASSWORD_AUTH',
			AuthParameters: {
				USERNAME: username,
				PASSWORD: password,
			},
		};

		const response = await requestCognitoUserPool({
			operation: 'InitiateAuth',
			region: amplifyConfig.Auth.region,
			params: jsonReq,
		});

		const { AuthenticationResult } = response;

		cacheTokens({
			idToken: AuthenticationResult.IdToken,
			accessToken: AuthenticationResult.AccessToken,
			clockDrift: 0,
			refreshToken: AuthenticationResult.RefreshToken,
			username: 'username',
			userPoolClientID: clientId,
		});

		Amplify.setUser({
			idToken: AuthenticationResult.IdToken,
			accessToken: AuthenticationResult.AccessToken,
			isSignedIn: true,
			refreshToken: AuthenticationResult.RefreshToken,
		});

		return {
			accessToken: AuthenticationResult.AccessToken,
			idToken: AuthenticationResult.IdToken,
			refreshToken: AuthenticationResult.RefreshToken,
		};
	}
}
