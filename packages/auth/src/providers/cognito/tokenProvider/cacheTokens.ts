// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyError, decodeJWT } from '@aws-amplify/core/internals/utils';
import { tokenOrchestrator } from '.';
import { AuthenticationResultType } from '../utils/clients/CognitoIdentityProvider/types';
import { DeviceMetadata } from './types';

export async function cacheCognitoTokens(
	AuthenticationResult: AuthenticationResultType & {
		NewDeviceMetadata?: DeviceMetadata;
	}
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

		if (AuthenticationResult.IdToken) {
			idToken = decodeJWT(AuthenticationResult.IdToken);
		}

		if (AuthenticationResult?.NewDeviceMetadata) {
			NewDeviceMetadata = AuthenticationResult.NewDeviceMetadata;
		}

		tokenOrchestrator.setTokens({
			tokens: {
				accessToken,
				idToken,
				refreshToken,
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
