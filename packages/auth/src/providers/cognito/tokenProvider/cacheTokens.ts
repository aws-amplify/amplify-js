// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyError, decodeJWT } from '@aws-amplify/core/internals/utils';
import { tokenOrchestrator } from '.';
import { AuthenticationResultType } from '../utils/clients/CognitoIdentityProvider/types';
import { getNewDeviceMetatada } from '../utils/signInHelpers';
import { DeviceMetadata } from './types';
import { AmplifyClassV6 } from '@aws-amplify/core';

export async function cacheCognitoTokens(
	AuthenticationResult: AuthenticationResultType,
	amplify: AmplifyClassV6
): Promise<void> {
	if (AuthenticationResult.AccessToken) {
		const accessToken = decodeJWT(AuthenticationResult.AccessToken);
		const accessTokenIssuedAtInMillis = (accessToken.payload.iat || 0) * 1000;
		const currentTime = new Date().getTime();
		const clockDrift =
			accessTokenIssuedAtInMillis > 0
				? accessTokenIssuedAtInMillis - currentTime
				: 0;
		let idToken;
		let refreshToken: string | undefined;
		let NewDeviceMetadata: DeviceMetadata | undefined;

		if (AuthenticationResult.RefreshToken) {
			refreshToken = AuthenticationResult.RefreshToken;
		}
		if (AuthenticationResult.NewDeviceMetadata) {
			NewDeviceMetadata = await getNewDeviceMetatada(
				AuthenticationResult.NewDeviceMetadata,
				amplify,
				AuthenticationResult.AccessToken
			);
		}
		if (AuthenticationResult.IdToken) {
			idToken = decodeJWT(AuthenticationResult.IdToken);
		}

		tokenOrchestrator.setTokens({
			tokens: {
				accessToken,
				idToken,
				refreshToken,
				NewDeviceMetadata,
				clockDrift,
			},
		});
	} else {
		// This would be a service error
		throw new AmplifyError({
			message: 'Invalid tokens',
			name: 'InvalidTokens',
			recoverySuggestion: 'Check Cognito UserPool settings',
		});
	}
}
