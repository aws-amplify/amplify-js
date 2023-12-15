// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, AuthConfig } from '@aws-amplify/core';
import { AuthAdditionalInfo, AuthDeliveryMedium } from '../../../types';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { AuthPasswordlessFlow } from '../types/models';
import { SignInWithOTPInput } from '../types/inputs';
import { SignInWithOTPOutput } from '../types/outputs';
import { AuthPasswordlessSignInAndSignUpOptions } from '../types/options';
import {
	createUserForPasswordlessSignUp,
	handlePasswordlessSignIn,
} from './passwordless';

export const signInWithOTP = async <
	T extends AuthPasswordlessFlow = AuthPasswordlessFlow
>(
	input: SignInWithOTPInput<T>
): Promise<SignInWithOTPOutput> => {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	console.log('authConfig in signinwithotp: ', authConfig);

	assertTokenProviderConfig(authConfig);
	const { userPoolId } = authConfig;
	const { username, flow, destination, options } = input;

	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptySignInUsername
	);

	switch (flow) {
		case 'SIGN_UP_AND_SIGN_IN':
			const signUpOptions = options as AuthPasswordlessSignInAndSignUpOptions;
			const userAttributes = signUpOptions?.userAttributes;
			let createUserPayload = { username, destination };
			if (destination === 'EMAIL') {
				Object.assign(createUserPayload, { email: userAttributes?.email });
			} else {
				Object.assign(createUserPayload, {
					phone_number: userAttributes?.phone_number,
				});
			}
			// creating a new user on Cognito
			const response = createUserForPasswordlessSignUp(
				createUserPayload,
				userPoolId,
				userAttributes
			);

			console.log('response: ', response);
			// api gateway response
			const preIntitiateAuthResponse = {
				username: 'Joe@example.com',
				userAttributes: {
					email: 'Joe@example.com',
					phone_number: '+15551237890',
				},
				deliveryMedium: 'SMS',
				userPoolId: 'abcde12345678',
				region: 'us-west-2',
			};
	}

	const { ChallengeParameters } = await handlePasswordlessSignIn(
		{ signInMethod: 'OTP', destination, username },
		authConfig as AuthConfig['Cognito']
	);

	return {
		isSignedIn: false,
		nextStep: {
			signInStep: 'CONFIRM_SIGN_IN_WITH_OTP',
			additionalInfo: ChallengeParameters as AuthAdditionalInfo,
			codeDeliveryDetails: {
				deliveryMedium:
					ChallengeParameters?.deliveryMedium as AuthDeliveryMedium,
				destination: ChallengeParameters?.destination,
			},
		},
	};
};
