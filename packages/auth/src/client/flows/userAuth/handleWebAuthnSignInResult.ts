// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import { AuthErrorCodes } from '../../../common/AuthErrorStrings';
import { createRespondToAuthChallengeClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import {
	ChallengeName,
	ChallengeParameters,
} from '../../../foundation/factories/serviceClients/cognitoIdentityProvider/types';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';
import { createCognitoUserPoolEndpointResolver } from '../../../providers/cognito/factories';
import { cacheCognitoTokens } from '../../../providers/cognito/tokenProvider/cacheTokens';
import { dispatchSignedInHubEvent } from '../../../providers/cognito/utils/dispatchSignedInHubEvent';
import { setActiveSignInState, signInStore } from '../../../client/utils/store';
import { getAuthUserAgentValue } from '../../../utils';
import { getPasskey } from '../../utils/passkey';
import {
	PasskeyErrorCode,
	assertPasskeyError,
} from '../../utils/passkey/errors';
import { AuthError } from '../../../errors/AuthError';
import { getNewDeviceMetadata } from '../../../providers/cognito/utils/getNewDeviceMetadata';

import { WebAuthnSignInResult } from './types';

export async function handleWebAuthnSignInResult(
	challengeParameters: ChallengeParameters,
): Promise<WebAuthnSignInResult> {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { username, signInSession, signInDetails, challengeName } =
		signInStore.getState();

	if (challengeName !== 'WEB_AUTHN' || !username) {
		throw new AuthError({
			name: AuthErrorCodes.SignInException,
			message: 'Unable to proceed due to invalid sign in state.',
		});
	}

	const { CREDENTIAL_REQUEST_OPTIONS: credentialRequestOptions } =
		challengeParameters;

	assertPasskeyError(
		!!credentialRequestOptions,
		PasskeyErrorCode.InvalidPasskeyAuthenticationOptions,
	);

	const cred = await getPasskey(JSON.parse(credentialRequestOptions));

	const respondToAuthChallenge = createRespondToAuthChallengeClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: authConfig.userPoolEndpoint,
		}),
	});

	const {
		ChallengeName: nextChallengeName,
		ChallengeParameters: nextChallengeParameters,
		AuthenticationResult: authenticationResult,
		Session: nextSession,
	} = await respondToAuthChallenge(
		{
			region: getRegionFromUserPoolId(authConfig.userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.ConfirmSignIn),
		},
		{
			ChallengeName: 'WEB_AUTHN',
			ChallengeResponses: {
				USERNAME: username,
				CREDENTIAL: JSON.stringify(cred),
			},
			ClientId: authConfig.userPoolClientId,
			Session: signInSession,
		},
	);

	setActiveSignInState({
		signInSession: nextSession,
		username,
		challengeName: nextChallengeName as ChallengeName,
		signInDetails,
	});

	if (authenticationResult) {
		await cacheCognitoTokens({
			...authenticationResult,
			username,
			NewDeviceMetadata: await getNewDeviceMetadata({
				userPoolId: authConfig.userPoolId,
				userPoolEndpoint: authConfig.userPoolEndpoint,
				newDeviceMetadata: authenticationResult.NewDeviceMetadata,
				accessToken: authenticationResult.AccessToken,
			}),
			signInDetails,
		});
		signInStore.dispatch({ type: 'RESET_STATE' });
		await dispatchSignedInHubEvent();

		return {
			isSignedIn: true,
			nextStep: { signInStep: 'DONE' },
		};
	}

	if (nextChallengeName === 'WEB_AUTHN') {
		throw new AuthError({
			name: AuthErrorCodes.SignInException,
			message:
				'Sequential WEB_AUTHN challenges returned from underlying service cannot be handled.',
		});
	}

	return {
		challengeName: nextChallengeName as ChallengeName,
		challengeParameters: nextChallengeParameters as ChallengeParameters,
	};
}
