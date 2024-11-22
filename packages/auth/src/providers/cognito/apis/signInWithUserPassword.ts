// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';

import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertServiceError } from '../../../errors/utils/assertServiceError';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import {
	ChallengeName,
	ChallengeParameters,
} from '../../../foundation/factories/serviceClients/cognitoIdentityProvider/types';
import {
	getActiveSignInUsername,
	getNewDeviceMetadata,
	getSignInResult,
	getSignInResultFromError,
	handleUserPasswordAuthFlow,
	retryOnResourceNotFoundException,
} from '../utils/signInHelpers';
import { InitiateAuthException } from '../types/errors';
import {
	CognitoAuthSignInDetails,
	SignInWithUserPasswordInput,
	SignInWithUserPasswordOutput,
} from '../types';
import {
	cleanActiveSignInState,
	setActiveSignInState,
} from '../../../client/utils/store';
import { cacheCognitoTokens } from '../tokenProvider/cacheTokens';
import { tokenOrchestrator } from '../tokenProvider';
import { dispatchSignedInHubEvent } from '../utils/dispatchSignedInHubEvent';

import { resetAutoSignIn } from './autoSignIn';

/**
 * Signs a user in using USER_PASSWORD_AUTH AuthFlowType
 *
 * @param input - The SignInWithUserPasswordInput object
 * @returns SignInWithUserPasswordOutput
 * @throws service: {@link InitiateAuthException } - Cognito service error thrown during the sign-in process.
 * @throws validation: {@link AuthValidationErrorCode  } - Validation errors thrown when either username or password
 *  are not defined.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function signInWithUserPassword(
	input: SignInWithUserPasswordInput,
): Promise<SignInWithUserPasswordOutput> {
	const { username, password, options } = input;
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	const signInDetails: CognitoAuthSignInDetails = {
		loginId: username,
		authFlowType: 'USER_PASSWORD_AUTH',
	};
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
			ChallengeName: retiredChallengeName,
			ChallengeParameters: retriedChallengeParameters,
			AuthenticationResult,
			Session,
		} = await retryOnResourceNotFoundException(
			handleUserPasswordAuthFlow,
			[username, password, metadata, authConfig, tokenOrchestrator],
			username,
			tokenOrchestrator,
		);
		const activeUsername = getActiveSignInUsername(username);
		// sets up local state used during the sign-in process
		setActiveSignInState({
			signInSession: Session,
			username: activeUsername,
			challengeName: retiredChallengeName as ChallengeName,
			signInDetails,
		});
		if (AuthenticationResult) {
			cleanActiveSignInState();
			await cacheCognitoTokens({
				...AuthenticationResult,
				username: activeUsername,
				NewDeviceMetadata: await getNewDeviceMetadata({
					userPoolId: authConfig.userPoolId,
					userPoolEndpoint: authConfig.userPoolEndpoint,
					newDeviceMetadata: AuthenticationResult.NewDeviceMetadata,
					accessToken: AuthenticationResult.AccessToken,
				}),
				signInDetails,
			});

			await dispatchSignedInHubEvent();

			resetAutoSignIn();

			return {
				isSignedIn: true,
				nextStep: { signInStep: 'DONE' },
			};
		}

		return getSignInResult({
			challengeName: retiredChallengeName as ChallengeName,
			challengeParameters: retriedChallengeParameters as ChallengeParameters,
		});
	} catch (error) {
		cleanActiveSignInState();
		resetAutoSignIn();
		assertServiceError(error);
		const result = getSignInResultFromError(error.name);
		if (result) return result;
		throw error;
	}
}
