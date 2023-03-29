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
import {
	CognitoSignUpOptions,
	CognitoUserAttributeKey,
	CustomAttribute,
	ValidationData,
} from '..';
import { signUpClient } from '../utils/clients/SignUpClient';
import { assertServiceError } from '../../../error/utils/assertServiceError';
import { AuthError } from '../../../error/AuthError';
import { assertValidationError } from '../../../error/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../error/types/validation';

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
    const username = signUpRequest.username
	const password = signUpRequest.password
	assertValidationError(!!username, AuthValidationErrorCode.EmptySignUpUsername)
	assertValidationError(!!password, AuthValidationErrorCode.EmptySignUpPassword)
	// TODO: implement autoSignIn
	let validationData: AttributeType[] | undefined;
	const _config = Amplify.config


	if (signUpRequest.options?.serviceOptions?.validationData) {
		validationData = mapValidationData(
			signUpRequest.options?.serviceOptions?.validationData
		);
	}
	try {
		const res: SignUpCommandOutput = await signUpClient({
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
		const { DeliveryMedium, Destination, AttributeName } = {
			...CodeDeliveryDetails,
		};
	
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
	} catch (error) {
		assertServiceError(error)
		throw new AuthError({name: error.name, message:error.message})
	}

	
}

function mapValidationData(data: ValidationData): AttributeType[] {
	return Object.entries(data).map(([key, value]) => ({
		Name: key,
		Value: value,
	}));
}
