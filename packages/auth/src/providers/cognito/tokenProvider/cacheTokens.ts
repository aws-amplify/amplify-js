// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyError, decodeJWT } from '@aws-amplify/core/internals/utils';
import type { AmplifyContext } from '@aws-amplify/core';

import { CognitoAuthSignInDetails } from '../types';
import { AuthenticationResultType } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider/types';

import { tokenOrchestrator as globalTokenOrchestrator } from './tokenProvider';
import { getContextTokenOrchestrator } from './contextTokenOrchestrators';
import { CognitoAuthTokens, DeviceMetadata } from './types';

export async function cacheCognitoTokens(
	AuthenticationResult: AuthenticationResultType & {
		NewDeviceMetadata?: DeviceMetadata;
		username: string;
		signInDetails?: CognitoAuthSignInDetails;
	},
	ctx?: AmplifyContext,
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
		let deviceMetadata: DeviceMetadata | undefined;

		if (AuthenticationResult.RefreshToken) {
			refreshToken = AuthenticationResult.RefreshToken;
		}

		if (AuthenticationResult.IdToken) {
			idToken = decodeJWT(AuthenticationResult.IdToken);
		}

		if (AuthenticationResult?.NewDeviceMetadata) {
			deviceMetadata = AuthenticationResult.NewDeviceMetadata;
		}

		const tokens: CognitoAuthTokens = {
			accessToken,
			idToken,
			refreshToken,
			clockDrift,
			deviceMetadata,
			username: AuthenticationResult.username,
		};

		if (AuthenticationResult?.signInDetails) {
			tokens.signInDetails = AuthenticationResult.signInDetails;
		}

		// Resolve the per-context orchestrator from the provided context (via its
		// token provider object); fall back to the module-level singleton for the
		// global `Amplify.configure()` path when there is no context orchestrator.
		const orchestrator =
			getContextTokenOrchestrator(ctx?.libraryOptions?.Auth?.tokenProvider) ??
			globalTokenOrchestrator;

		await orchestrator.setTokens({
			tokens,
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
