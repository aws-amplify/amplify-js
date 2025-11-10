// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthConfig } from '@aws-amplify/core';
import {
	assertTokenProviderConfig,
	deDupeAsyncFunction,
	decodeJWT,
} from '@aws-amplify/core/internals/utils';

import { CognitoAuthTokens, TokenRefresher } from '../tokenProvider/types';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';
import { assertAuthTokensWithRefreshToken } from '../utils/types';
import { AuthError } from '../../../errors/AuthError';
import { createCognitoUserPoolEndpointResolver } from '../factories';
import { createGetTokensFromRefreshTokenClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { ClientMetadata } from '../types';

const refreshAuthTokensFunction: TokenRefresher = async ({
	tokens,
	authConfig,
	username,
	clientMetadata,
}: {
	tokens: CognitoAuthTokens;
	authConfig?: AuthConfig;
	username: string;
	clientMetadata?: ClientMetadata;
}): Promise<CognitoAuthTokens> => {
	assertTokenProviderConfig(authConfig?.Cognito);
	const { userPoolId, userPoolClientId, userPoolEndpoint } = authConfig.Cognito;
	const region = getRegionFromUserPoolId(userPoolId);
	assertAuthTokensWithRefreshToken(tokens);

	const getTokensFromRefreshToken = createGetTokensFromRefreshTokenClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});

	const { AuthenticationResult } = await getTokensFromRefreshToken(
		{ region },
		{
			ClientId: userPoolClientId,
			RefreshToken: tokens.refreshToken,
			DeviceKey: tokens.deviceMetadata?.deviceKey,
			ClientMetadata: clientMetadata,
		},
	);

	const accessToken = decodeJWT(AuthenticationResult?.AccessToken ?? '');
	const idToken = AuthenticationResult?.IdToken
		? decodeJWT(AuthenticationResult.IdToken)
		: undefined;
	const { iat } = accessToken.payload;
	// This should never happen. If it does, it's a bug from the service.
	if (!iat) {
		throw new AuthError({
			name: 'iatNotFoundException',
			message: 'iat not found in access token',
		});
	}
	const clockDrift = iat * 1000 - new Date().getTime();

	return {
		accessToken,
		idToken,
		clockDrift,
		refreshToken: AuthenticationResult?.RefreshToken ?? tokens.refreshToken,
		username,
	};
};

export const refreshAuthTokens = deDupeAsyncFunction(refreshAuthTokensFunction);
export const refreshAuthTokensWithoutDedupe = refreshAuthTokensFunction;
