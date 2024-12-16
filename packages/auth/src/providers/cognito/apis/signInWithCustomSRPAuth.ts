// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';

import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { assertServiceError } from '../../../errors/utils/assertServiceError';
import {
	getActiveSignInUsername,
	getNewDeviceMetadata,
	getSignInResult,
	getSignInResultFromError,
	handleCustomSRPAuthFlow,
} from '../utils/signInHelpers';
import {
	InitiateAuthException,
	RespondToAuthChallengeException,
} from '../types/errors';
import {
	CognitoAuthSignInDetails,
	SignInWithCustomSRPAuthInput,
	SignInWithCustomSRPAuthOutput,
} from '../types';
import {
	cleanActiveSignInState,
	setActiveSignInState,
} from '../../../client/utils/store';
import { cacheCognitoTokens } from '../tokenProvider/cacheTokens';
import {
	ChallengeName,
	ChallengeParameters,
} from '../../../foundation/factories/serviceClients/cognitoIdentityProvider/types';
import { tokenOrchestrator } from '../tokenProvider';
import { dispatchSignedInHubEvent } from '../utils/dispatchSignedInHubEvent';

/**
 * Signs a user in using a custom authentication flow with SRP
 *
 * @param input -  The SignInWithCustomSRPAuthInput object
 * @returns SignInWithCustomSRPAuthOutput
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException } - Cognito
 * service errors thrown during the sign-in process.
 * @throws validation: {@link AuthValidationErrorCode  } - Validation errors thrown when either username or password
 *  are not defined.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function signInWithCustomSRPAuth(
	input: SignInWithCustomSRPAuthInput,
): Promise<SignInWithCustomSRPAuthOutput> {
	const { username, password, options } = input;
	const signInDetails: CognitoAuthSignInDetails = {
		loginId: username,
		authFlowType: 'CUSTOM_WITH_SRP',
	};
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const metadata = options?.clientMetadata;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptySignInUsername,
	);
	assertValidationError(
		!!password,
		AuthValidationErrorCode.EmptySignInPassword,
	);

	try {
		const {
			ChallengeName: handledChallengeName,
			ChallengeParameters: handledChallengeParameters,
			AuthenticationResult,
			Session,
		} = await handleCustomSRPAuthFlow(
			username,
			password,
			metadata,
			authConfig,
			tokenOrchestrator,
		);

		const activeUsername = getActiveSignInUsername(username);
		// sets up local state used during the sign-in process
		setActiveSignInState({
			signInSession: Session,
			username: activeUsername,
			challengeName: handledChallengeName as ChallengeName,
			signInDetails,
		});
		if (AuthenticationResult) {
			await cacheCognitoTokens({
				username: activeUsername,
				...AuthenticationResult,
				NewDeviceMetadata: await getNewDeviceMetadata({
					userPoolId: authConfig.userPoolId,
					userPoolEndpoint: authConfig.userPoolEndpoint,
					newDeviceMetadata: AuthenticationResult.NewDeviceMetadata,
					accessToken: AuthenticationResult.AccessToken,
				}),
				signInDetails,
			});
			cleanActiveSignInState();

			await dispatchSignedInHubEvent();

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
		cleanActiveSignInState();
		assertServiceError(error);
		const result = getSignInResultFromError(error.name);
		if (result) return result;
		throw error;
	}
}
