// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';

import { getAuthUserAgentValue } from '../../../../utils';
import { CognitoAuthSignInDetails } from '../../types/models';
import {
	initiateAuth,
	respondToAuthChallenge,
} from '../../utils/clients/CognitoIdentityProvider';
import {
	InitiateAuthCommandInput,
	RespondToAuthChallengeCommandInput,
} from '../../utils/clients/CognitoIdentityProvider/types';
import { getRegion } from '../../utils/clients/CognitoIdentityProvider/utils';
import {
	getActiveSignInUsername,
	setActiveSignInUsername,
} from '../../utils/signInHelpers';
import { AuthAction } from '@aws-amplify/core/internals/utils';
import { setActiveSignInState } from '../../utils/signInStore';

import {
	SignInWithEmailAndMagicLinkInput,
	SignInWithEmailAndOTPInput,
	SignInWithSMSAndOTPInput,
} from '../../types/inputs';
import {
	SignInWithEmailAndMagicLinkOutput,
	SignInWithEmailAndOTPOutput,
	SignInWithSMSAndOTPOutput,
} from '../../types/outputs';

import { assertValidationError } from '../../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../../errors/types/validation';

import {
	SignUpWithEmailAndMagicLinkInput,
	SignUpWithEmailAndOTPInput,
	SignUpWithSMSAndOTPInput,
} from '../../types/inputs';
import {
	SignUpWithEmailAndMagicLinkOutput,
	SignUpWithEmailAndOTPOutput,
	SignUpWithSMSAndOTPOutput,
} from '../../types/outputs';

/**
 * @internal
 */
export function signUpPasswordless(
	input: SignUpWithEmailAndMagicLinkInput
): Promise<SignUpWithEmailAndMagicLinkOutput>;

/**
 * @internal
 */
export function signUpPasswordless(
	input: SignUpWithEmailAndOTPInput
): Promise<SignUpWithEmailAndOTPOutput>;

/**
 * @internal
 */
export function signUpPasswordless(
	input: SignUpWithSMSAndOTPInput
): Promise<SignUpWithSMSAndOTPOutput>;

/**
 * @internal
 */
export function signUpPasswordless(
	input:
		| SignUpWithEmailAndMagicLinkInput
		| SignUpWithEmailAndOTPInput
		| SignUpWithSMSAndOTPInput
) {
	// TODO: needs implementation
	const {
		username,
		passwordless: { deliveryMedium, method },
		options: { userAttributes, clientMetadata },
	} = input;
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
