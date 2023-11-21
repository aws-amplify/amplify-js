// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AssociateSoftwareTokenException,
	RespondToAuthChallengeException,
	VerifySoftwareTokenException,
} from '~/src/providers/cognito/types/errors';
import {
	ConfirmSignInInput,
	ConfirmSignInOutput,
} from '~/src/providers/cognito/types';
import {
	cleanActiveSignInState,
	setActiveSignInState,
	signInStore,
} from '~/src/providers/cognito/utils/signInStore';
import { AuthError } from '~/src/errors/AuthError';
import {
	getNewDeviceMetatada,
	getSignInResult,
	getSignInResultFromError,
	handleChallengeName,
} from '~/src/providers/cognito/utils/signInHelpers';
import { assertServiceError } from '~/src/errors/utils/assertServiceError';
import { assertValidationError } from '~/src/errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '~/src/errors/types/validation';
import { AuthErrorCodes } from '~/src/common/AuthErrorStrings';
import { Amplify, Hub } from '@aws-amplify/core';
import {
	AMPLIFY_SYMBOL,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';
import { cacheCognitoTokens } from '~/src/providers/cognito/tokenProvider/cacheTokens';
import {
	ChallengeName,
	ChallengeParameters,
} from '~/src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { tokenOrchestrator } from '~/src/providers/cognito/tokenProvider';

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
	input: ConfirmSignInInput,
): Promise<ConfirmSignInOutput> {
	const { challengeResponse, options } = input;
	const { username, challengeName, signInSession, signInDetails } =
		signInStore.getState();

	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);

	const clientMetaData = options?.clientMetadata;

	assertValidationError(
		!!challengeResponse,
		AuthValidationErrorCode.EmptyChallengeResponse,
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
			ChallengeName: handledChallengeName,
			AuthenticationResult,
			ChallengeParameters: handledChallengeParameters,
		} = await handleChallengeName(
			username,
			challengeName as ChallengeName,
			signInSession,
			challengeResponse,
			authConfig,
			tokenOrchestrator,
			clientMetaData,
			options,
		);

		// sets up local state used during the sign-in process
		setActiveSignInState({
			signInSession: Session,
			username,
			challengeName: handledChallengeName as ChallengeName,
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
					AuthenticationResult.AccessToken,
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
				AMPLIFY_SYMBOL,
			);

			return {
				isSignedIn: true,
				nextStep: { signInStep: 'DONE' },
			};
		}

		return getSignInResult({
			challengeName: handledChallengeName as ChallengeName,
			challengeParameters: handledChallengeParameters as ChallengeParameters,
		});
	} catch (error) {
		assertServiceError(error);
		const result = getSignInResultFromError(error.name);
		if (result) return result;
		throw error;
	}
}
