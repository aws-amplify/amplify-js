// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
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
import { signUp as signUpClient } from '../utils/clients/CognitoIdentityProvider';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { SignUpException } from '../types/errors';
import { AttributeType, CodeDeliveryDetailsType } from '../utils/clients/CognitoIdentityProvider/types';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';

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
	const { clientMetadata, userPoolId, userPoolWebClientId } =
		AmplifyV6.getConfig().Auth;
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

	const res = await signUpClient(
		{ region: getRegion(userPoolId) },
		{
			Username: username,
			Password: password,
			UserAttributes: attributes,
			ClientMetadata:
				signUpRequest.options?.serviceOptions?.clientMetadata ?? clientMetadata,
			ValidationData: validationData,
			ClientId: userPoolWebClientId,
		}
	);

	const { UserConfirmed, CodeDeliveryDetails, UserSub } = res;	

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
					deliveryMedium: CodeDeliveryDetails.DeliveryMedium
						? (CodeDeliveryDetails.DeliveryMedium as DeliveryMedium)
						: undefined,
					destination: CodeDeliveryDetails.Destination,
					attributeName: CodeDeliveryDetails.AttributeName,
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
