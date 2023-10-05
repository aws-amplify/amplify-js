// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	InitiateAuthException,
	RespondToAuthChallengeException,
} from '../types/errors';
import { signInWithCustomAuth } from './signInWithCustomAuth';
import { signInWithCustomSRPAuth } from './signInWithCustomSRPAuth';
import { signInWithSRP } from './signInWithSRP';
import { signInWithUserPassword } from './signInWithUserPassword';
import { assertUserNotAuthenticated } from '../utils/signInHelpers';
import { SignInInput, SignInOutput } from '../types';
import { tokenOrchestrator } from '../tokenProvider';
import { AuthError } from '../../../errors/AuthError';
/**
 * Signs a user in
 *
 * @param input -  The SignInInput object
 * @returns SignInOutput
 * @throws service: {@link InitiateAuthException }, {@link RespondToAuthChallengeException }
 *  - Cognito service errors thrown during the sign-in process.
 * @throws validation: {@link AuthValidationErrorCode  } - Validation errors thrown when either username or password
 *  are not defined.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function signIn(input: SignInInput): Promise<SignInOutput> {
	await assertUserNotAuthenticated();
	try {
		console.log('input', input);
		return await _signIn(input);
	} catch (error) {
		if (error instanceof AuthError && (await shouldRetrySignIn(error))) {
			await tokenOrchestrator.clearDeviceMetadata();
			return await _signIn(input);
		} else {
			throw error;
		}
	}
}

async function _signIn(input: SignInInput): Promise<SignInOutput> {
	const authFlowType = input.options?.serviceOptions?.authFlowType;
	switch (authFlowType) {
		case 'USER_SRP_AUTH':
			return await signInWithSRP(input);
		case 'USER_PASSWORD_AUTH':
			return await signInWithUserPassword(input);
		case 'CUSTOM_WITHOUT_SRP':
			return await signInWithCustomAuth(input);
		case 'CUSTOM_WITH_SRP':
			return await signInWithCustomSRPAuth(input);
		default:
			return await signInWithSRP(input);
	}
}

const shouldRetrySignIn = async (error: AuthError) => {
	const deviceMetadata = await tokenOrchestrator.getDeviceMetadata();
	return (
		deviceMetadata?.deviceKey &&
		error.name === RespondToAuthChallengeException.ResourceNotFoundException &&
		error.message === 'Device does not exist.'
	);
};
