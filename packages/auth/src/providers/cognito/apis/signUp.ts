// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
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
	CognitoUserAttributeKey,
	CustomAttribute,
	ValidationData,
} from '..';
import { UserpoolClient } from '../utils/clients/UserPoolClient';

/**
 * Creates a user
 *
 * @param signUpRequest - The SignUpRequest object
 * @returns AuthSignUpResult
 *
 */
export async function signUp(
	signUpRequest: SignUpRequest<CognitoUserAttributeKey, CognitoSignUpOptions>
): Promise<AuthSignUpResult<AuthStandardAttributeKey | CustomAttribute>> {
	let validationData: AttributeType[] | undefined;
	const _config = Amplify.config;
	if (signUpRequest.options?.serviceOptions?.validationData) {
		validationData = mapValidationData(
			signUpRequest.options?.serviceOptions?.validationData
		);
	}

	const res: SignUpCommandOutput = await UserpoolClient.signUp({
		Username: signUpRequest.username,
		Password: signUpRequest.password,
		UserAttributes: signUpRequest.options?.userAttributes.map(el => {
			return { Name: el.userAttributeKey.toString(), Value: el.value };
		}),
		ClientMetadata:
			signUpRequest.options?.serviceOptions?.clientMetadata ??
			_config.clientMetadata,
		ValidationData: validationData,
	});

	const { UserConfirmed, CodeDeliveryDetails } = res;

	if (UserConfirmed === true) {
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
					deliveryMedium: CodeDeliveryDetails?.DeliveryMedium
						? (CodeDeliveryDetails?.DeliveryMedium as DeliveryMedium)
						: undefined,
					destination: CodeDeliveryDetails?.Destination
						? (CodeDeliveryDetails?.Destination as string)
						: undefined,
					attributeName: CodeDeliveryDetails?.AttributeName
						? (CodeDeliveryDetails?.AttributeName as AuthStandardAttributeKey)
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
