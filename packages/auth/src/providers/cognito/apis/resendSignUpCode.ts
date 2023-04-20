// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import type { ResendConfirmationCodeCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { AuthStandardAttributeKey, DeliveryMedium } from '../../../types';
import {
	AuthCodeDeliveryDetails,
	AuthPluginOptions,
	CognitoResendSignUpCodeOptions,
	CognitoUserAttributeKey,
	ResendSignUpCodeRequest,
} from '..';
import { assertServiceError } from '../../../errors/utils/assertServiceError';
import { AuthError } from '../../../errors/AuthError';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { SignUpException } from '../types/errors/service';
import { resendSignUpConfirmationCodeClient } from '../utils/clients/resendSignUpCodeClient';

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

// TODO(Samaritan1011001): Function type was changed, confirm it's right

export async function resendSignUpCode<
	PluginOptions extends CognitoResendSignUpCodeOptions = AuthPluginOptions
>(
	resendReq: ResendSignUpCodeRequest<PluginOptions>
): Promise<AuthCodeDeliveryDetails<CognitoUserAttributeKey>> {
	const username = resendReq.username;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptySignUpUsername
	);
	const config = Amplify.config;
	try {
		const res: ResendConfirmationCodeCommandOutput =
			await resendSignUpConfirmationCodeClient({
				Username: username,
				ClientMetadata:
					resendReq.options?.pluginOptions?.clientMetadata ??
					config.clientMetadata,
			});
		const { DeliveryMedium, AttributeName, Destination } = {
			...res.CodeDeliveryDetails,
		};
		return {
			destination: Destination as string,
			deliveryMedium: DeliveryMedium as DeliveryMedium,
			attributeName: AttributeName
				? (AttributeName as AuthStandardAttributeKey)
				: undefined,
		};
	} catch (error) {
		assertServiceError(error);
		throw new AuthError({ name: error.name, message: error.message });
	}
}
