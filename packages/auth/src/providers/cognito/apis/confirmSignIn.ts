// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	VerifySoftwareTokenException,
	RespondToAuthChallengeException,
	AssociateSoftwareTokenException,
} from '../types/errors';
import { ConfirmSignInInput, ConfirmSignInOutput } from '../types';
import {
	cleanActiveSignInState,
	setActiveSignInState,
	signInStore,
} from '../utils/signInStore';
import { AuthError } from '../../../errors/AuthError';
import {
	getNewDeviceMetatada,
	getSignInResult,
	getSignInResultFromError,
	handleChallengeName,
} from '../utils/signInHelpers';
import { assertServiceError } from '../../../errors/utils/assertServiceError';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { AuthErrorCodes } from '../../../common/AuthErrorStrings';
import { Amplify, Hub } from '@aws-amplify/core';
import {
	AMPLIFY_SYMBOL,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';
import { cacheCognitoTokens } from '../tokenProvider/cacheTokens';
import {
	ChallengeName,
	ChallengeParameters,
} from '../utils/clients/CognitoIdentityProvider/types';
import { tokenOrchestrator } from '../tokenProvider';
import { getCurrentUser } from './getCurrentUser';

/**
 * Continues or completes the sign in process when required by the initial call to `signIn`.
 *
 * @param input -  The ConfirmSignInInput object
 * @returns ConfirmSignInOutput
 * @throws  -{@link VerifySoftwareTokenException }:
 * Thrown due to an invalid MFA token.
 * @throws  -{@link RespondToAuthChallengeException }:
 * Thrown due to an invalid auth challenge response.
 * @throws  -{@link AssociateSoftwareTokenException}:
 * Thrown due to a service error during the MFA setup process.
 * @throws  -{@link AuthValidationErrorCode }:
 * Thrown when `challengeResponse` is not defined.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function confirmSignIn(
	input: ConfirmSignInInput
): Promise<ConfirmSignInOutput> {
	const { challengeResponse, options } = input;
	const { username, challengeName, signInSession, signInDetails } =
		signInStore.getState();

	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);

	const clientMetaData = options?.clientMetadata;

	assertValidationError(
		!!challengeResponse,
		AuthValidationErrorCode.EmptyChallengeResponse
	);

	if (!username || !challengeName || !signInSession)
		// TODO: remove this error message for production apps
		throw new AuthError({
			name: AuthErrorCodes.SignInException,
			message: `
			An error occurred during the sign in process. 
			
			This most likely occurred due to:
			1. signIn was not called before confirmSignIn.
			2. signIn threw an exception.
			3. page was refreshed during the sign in flow.
			`,
			recoverySuggestion:
				'Make sure a successful call to signIn is made before calling confirmSignIn' +
				'and that the page is not refreshed until the sign in process is done.',
		});

	try {
		const {
			Session,
			ChallengeName,
			AuthenticationResult,
			ChallengeParameters,
		} = await handleChallengeName(
			username,
			challengeName as ChallengeName,
			signInSession,
			challengeResponse,
			authConfig,
			tokenOrchestrator,
			clientMetaData,
			options
		);

		// sets up local state used during the sign-in process
		setActiveSignInState({
			signInSession: Session,
			username,
			challengeName: ChallengeName as ChallengeName,
			signInDetails,
		});

		if (AuthenticationResult) {
			cleanActiveSignInState();
			await cacheCognitoTokens({
				username,
				...AuthenticationResult,
				NewDeviceMetadata: await getNewDeviceMetatada(
					authConfig.userPoolId,
					AuthenticationResult.NewDeviceMetadata,
					AuthenticationResult.AccessToken
				),
				signInDetails,
			});
			Hub.dispatch(
				'auth',
				{
					event: 'signedIn',
					data: await getCurrentUser(),
				},
				'Auth',
				AMPLIFY_SYMBOL
			);
			return {
				isSignedIn: true,
				nextStep: { signInStep: 'DONE' },
			};
		}

		return getSignInResult({
			challengeName: ChallengeName as ChallengeName,
			challengeParameters: ChallengeParameters as ChallengeParameters,
		});
	} catch (error) {
		assertServiceError(error);
		const result = getSignInResultFromError(error.name);
		if (result) return result;
		throw error;
	}
}
