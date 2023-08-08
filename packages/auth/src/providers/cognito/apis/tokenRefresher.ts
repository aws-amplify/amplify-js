import { TokenRefresher } from '../tokenProvider/types';
import { refreshToken } from '../utils/refreshTokens';
import { AuthConfig, AuthTokens, decodeJWT } from '@aws-amplify/core';

export const CognitoUserPoolTokenRefresher: TokenRefresher = async ({
	tokens,
	authConfig,
}: {
	tokens: AuthTokens;
	authConfig: AuthConfig;
}) => {
	const region = authConfig.userPoolId.split('_')[0];
	const refreshTokenString = tokens.metadata['refreshToken'];
	const result = await refreshToken(
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
	const accessTokenExpAt = accessToken.payload.exp;
	const idToken = result.AuthenticationResult.IdToken
		? decodeJWT(result.AuthenticationResult.IdToken)
		: undefined;
	const clockDrift = accessToken.payload.iat * 1000 - new Date().getTime();
	const metadata = tokens.metadata;

	return {
		accessToken,
		accessTokenExpAt,
		idToken,
		clockDrift,
		metadata,
	};
};
