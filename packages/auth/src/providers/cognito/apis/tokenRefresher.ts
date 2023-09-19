// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { CognitoAuthTokens, TokenRefresher } from '../tokenProvider/types';
import { AuthConfig } from '@aws-amplify/core';
import {
	assertTokenProviderConfig,
	decodeJWT,
} from '@aws-amplify/core/internals/utils';
import { initiateAuth } from '../utils/clients/CognitoIdentityProvider';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { assertAuthTokensWithRefreshToken } from '../utils/types';
import { AuthError } from '../../../errors/AuthError';

export const CognitoUserPoolTokenRefresher: TokenRefresher = async ({
	tokens,
	authConfig,
}: {
	tokens: CognitoAuthTokens;
	authConfig?: AuthConfig;
}): Promise<CognitoAuthTokens> => {
	assertTokenProviderConfig(authConfig?.Cognito);
	const region = getRegion(authConfig.Cognito.userPoolId);
	assertAuthTokensWithRefreshToken(tokens);
	const refreshTokenString = tokens.refreshToken;
	const { AuthenticationResult } = await initiateAuth(
		{ region },
		{
			ClientId: authConfig?.Cognito?.userPoolClientId,
			AuthFlow: 'REFRESH_TOKEN_AUTH',
			AuthParameters: {
				REFRESH_TOKEN: refreshTokenString,
			},
		}
	);

	const accessToken = decodeJWT(AuthenticationResult?.AccessToken ?? '');
	const idToken = AuthenticationResult?.IdToken
		? decodeJWT(AuthenticationResult.IdToken)
		: undefined;
	const iat = accessToken.payload.iat;
	// This should never happen. If it does, it's a bug from the service.
	if (!iat) {
		throw new AuthError({
			name: 'iatNotFoundException',
			message: 'iat not found in access token',
		});
	}
	const clockDrift = iat * 1000 - new Date().getTime();
	const refreshToken = AuthenticationResult?.RefreshToken;
	const NewDeviceMetadata = JSON.stringify(
		AuthenticationResult?.NewDeviceMetadata
	);

	return {
		accessToken,
		idToken,
		clockDrift,
		refreshToken,
		NewDeviceMetadata,
	};
};
