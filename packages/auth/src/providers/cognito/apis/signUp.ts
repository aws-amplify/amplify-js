// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import type {
	AttributeType,
	SignUpCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import {
	AuthSignUpResult,
	AuthSignUpStep,
	AuthStandardAttributeKey,
	DeliveryMedium,
	SignUpRequest,
} from '../../../types';
import { signUpClient } from '../utils/clients/SignUpClient';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { SignUpException } from '../types/errors';
import {
	CognitoUserAttributeKey,
	CognitoSignUpOptions,
	CustomAttribute,
	ValidationData,
} from '../types';

/**
 * Creates a user
 *
 * @param signUpRequest - The SignUpRequest object
 * @returns AuthSignUpResult
 * @throws service: {@link SignUpException } - Cognito service errors thrown during the sign-up process.
 * @throws validation: {@link AuthValidationErrorCode } - Validation errors thrown either username or password
 *  are not defined.
 *
 *
 * TODO: add config errors
 */
export async function signUp(
	signUpRequest: SignUpRequest<CognitoUserAttributeKey, CognitoSignUpOptions>
): Promise<AuthSignUpResult<AuthStandardAttributeKey | CustomAttribute>> {
	const username = signUpRequest.username;
	const password = signUpRequest.password;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptySignUpUsername
	);
	assertValidationError(
		!!password,
		AuthValidationErrorCode.EmptySignUpPassword
	);
	// TODO: implement autoSignIn
	let validationData: AttributeType[] | undefined;
	const config = Amplify.config;

	if (signUpRequest.options?.serviceOptions?.validationData) {
		validationData = mapValidationData(
			signUpRequest.options?.serviceOptions?.validationData
		);
	}
	const res: SignUpCommandOutput = await signUpClient({
		Username: username,
		Password: password,
		UserAttributes: signUpRequest.options?.userAttributes.map(el => {
			return { Name: el.userAttributeKey.toString(), Value: el.value };
		}),
		ClientMetadata:
			signUpRequest.options?.serviceOptions?.clientMetadata ??
			config.clientMetadata,
		ValidationData: validationData,
	});

	const { UserConfirmed, CodeDeliveryDetails } = res;
	const { DeliveryMedium, Destination, AttributeName } = {
		...CodeDeliveryDetails,
	};

	if (UserConfirmed) {
		return {
			isSignUpComplete: true,
			nextStep: {
				signUpStep: AuthSignUpStep.DONE,
			},
		};
	} else {
		return {
			isSignUpComplete: false,
			nextStep: {
				signUpStep: AuthSignUpStep.CONFIRM_SIGN_UP,
				codeDeliveryDetails: {
					deliveryMedium: DeliveryMedium
						? (DeliveryMedium as DeliveryMedium)
						: undefined,
					destination: Destination ? (Destination as string) : undefined,
					attributeName: AttributeName
						? (AttributeName as AuthStandardAttributeKey)
						: undefined,
				},
			},
		};
	}
}

function mapValidationData(data: ValidationData): AttributeType[] {
	return Object.entries(data).map(([key, value]) => ({
		Name: key,
		Value: value,
	}));
}
