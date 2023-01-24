import { Amplify, parseAWSExports } from '@aws-amplify/core';
import { requestCognitoUserPool } from '../client';
import { cacheTokens } from '../storage';

export async function confirmSignIn({ code }) {
	const amplifyConfig = parseAWSExports(Amplify.getConfig()) as any;
	const context = Amplify.getContext();

	if (amplifyConfig && amplifyConfig.Auth) {
		let Session = '';
		let username = '';

		if (context.Auth && context.Auth.confirmSignIn) {
			Session = context.Auth.confirmSignIn.Session;
			username = context.Auth.confirmSignIn.username;
		}
		const clientId = amplifyConfig.Auth.userPoolWebClientId;
		const challengeName = context.Auth.confirmSignIn.challengeName;
		const jsonReq = {
			ClientId: clientId,
			ValidationData: null,
			ChallengeResponses: {
				USERNAME: username,
				[`${challengeName}_CODE`]: code,
			},
			ChallengeName: challengeName,
			Session,
		};

		const { AuthenticationResult } = await requestCognitoUserPool({
			operation: 'RespondToAuthChallenge',
			params: jsonReq,
			region: amplifyConfig.Auth.region,
		});

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
