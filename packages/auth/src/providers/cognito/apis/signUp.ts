// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
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
import {
	CognitoSignUpOptions,
	CustomAttribute,
	CognitoUserAttributeKey,
} from '../types';
import { signUpClient } from '../utils/clients/SignUpClient';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { SignUpException } from '../types/errors';

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
	const { username, password, options } = signUpRequest;

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
	let attributes: AttributeType[] | undefined;

	if (options?.serviceOptions?.validationData) {
		validationData = toAttributeType(options?.serviceOptions?.validationData);
	}
	if (options?.userAttributes) {
		attributes = toAttributeType(options?.userAttributes);
	}

	const res: SignUpCommandOutput = await signUpClient({
		Username: username,
		Password: password,
		UserAttributes: attributes,
		ClientMetadata:
			signUpRequest.options?.serviceOptions?.clientMetadata ??
			AmplifyV6.getConfig().Auth?.clientMetadata,
		ValidationData: validationData,
	});

	const { UserConfirmed, CodeDeliveryDetails, UserSub } = res;
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
			userId: UserSub,
		};
	}
}

function toAttributeType<T extends Record<string, string | undefined>>(
	data: T
): AttributeType[] {
	return Object.entries(data).map(([key, value]) => ({
		Name: key,
		Value: value,
	}));
}
