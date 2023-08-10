import { CognitoAuthTokens, TokenRefresher } from '../tokenProvider/types';
import { AuthConfig, decodeJWT } from '@aws-amplify/core';
import { initiateAuth } from '../utils/clients/CognitoIdentityProvider';

export const CognitoUserPoolTokenRefresher: TokenRefresher = async ({
	tokens,
	authConfig,
}: {
	tokens: CognitoAuthTokens;
	authConfig: AuthConfig;
}) => {
	const region = authConfig.userPoolId.split('_')[0];
	const refreshTokenString = tokens.refreshToken;
	const result = await initiateAuth(
		{ region },
		{
			ClientId: authConfig.userPoolWebClientId,
			ClientMetadata: authConfig.clientMetadata,
			AuthFlow: 'REFRESH_TOKEN_AUTH',
			AuthParameters: {
				REFRESH_TOKEN: refreshTokenString,
			},
		}
	);

	const accessToken = decodeJWT(result.AuthenticationResult.AccessToken);
	const idToken = result.AuthenticationResult.IdToken
		? decodeJWT(result.AuthenticationResult.IdToken)
		: undefined;
	const clockDrift = accessToken.payload.iat * 1000 - new Date().getTime();
	const refreshToken = result.AuthenticationResult.RefreshToken;
	const NewDeviceMetadata = JSON.stringify(
		result.AuthenticationResult.NewDeviceMetadata
	);

	return {
		accessToken,
		idToken,
		clockDrift,
		refreshToken,
		NewDeviceMetadata,
	};
};
