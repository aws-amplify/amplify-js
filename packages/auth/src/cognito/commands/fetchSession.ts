import { Amplify, parseAWSExports } from '@aws-amplify/core';
import { requestCognitoUserPool } from '../client';
import { cacheTokens, readTokens } from '../storage';

export type SessionParams = {
	credentialsProvider: (token: string) => {
		accessKey: string;
		secretKey: string;
		sessionToken: string;
	};
};

export async function fetchSession(sessionParams?: SessionParams) {
	const amplifyConfig = parseAWSExports(Amplify.getConfig()) as any;
	if (amplifyConfig && amplifyConfig.Auth) {
		// load credentials from storage
		let tokens = readTokens({
			userPoolCliendId: amplifyConfig.Auth.userPoolWebClientId,
		});

		if (tokens) {
			const { accessToken, idToken, refreshToken } = tokens;
			if (
				!isTokenValid({ token: accessToken }) ||
				!isTokenValid({ token: idToken })
			) {
				const refreshedUser = await refreshTokens({
					refreshToken,
					clientId: amplifyConfig.Auth.userPoolWebClientId,
					region: amplifyConfig.Auth.region,
				});

				tokens = { ...refreshedUser, clockDrift: 0 };
			}
		}

		if (tokens) {
			let credentials;
			if (
				sessionParams &&
				typeof sessionParams.credentialsProvider === 'function'
			) {
				credentials = await sessionParams.credentialsProvider(tokens.idToken);
			}
			const { accessToken, idToken, refreshToken } = tokens;

			if (credentials) {
				Amplify.setUser({
					isSignedIn: true,
					accessToken,
					idToken,
					refreshToken,
					awsCreds: {
						accessKey: credentials.accessKey,
						secretKey: credentials.secretKey,
						sessionToken: credentials.sessionToken,
						identityId: credentials.identityId,
					},
				});
			} else {
				Amplify.setUser({
					isSignedIn: true,
					accessToken,
					idToken,
					refreshToken,
				});
			}
		}
		return tokens;
	}
}

function getTokenClaim({ token, claim }) {
	const payload = token.split('.')[1];
	if (!payload) return null;
	try {
		const payloadDecoded = window.atob(payload);

		const payloadObj = JSON.parse(payloadDecoded);
		if (payloadObj && payloadObj[claim]) {
			return payloadObj[claim];
		}
	} catch (err) {
		return null;
	}
}

const EXPIRATION_CLAIM = 'exp';

function isTokenValid({ token }) {
	const now = Math.floor(new Date().getTime() / 1000);
	const expiration = getTokenClaim({ token, claim: EXPIRATION_CLAIM });

	return Number.isInteger(expiration) && expiration > now;
}

async function refreshTokens({ refreshToken, clientId, region }) {
	const jsonReq = {
		ClientId: clientId,
		AuthFlow: 'REFRESH_TOKEN_AUTH',
		AuthParameters: {
			REFRESH_TOKEN: refreshToken,
		},
	};

	const response = await requestCognitoUserPool({
		operation: 'InitiateAuth',
		region,
		params: jsonReq,
	});

	const { AuthenticationResult } = response;

	cacheTokens({
		idToken: AuthenticationResult.IdToken,
		accessToken: AuthenticationResult.AccessToken,
		clockDrift: 0,
		refreshToken,
		username: 'username',
		userPoolClientID: clientId,
	});

	return {
		accessToken: AuthenticationResult.AccessToken,
		idToken: AuthenticationResult.IdToken,
		refreshToken,
	};
}
