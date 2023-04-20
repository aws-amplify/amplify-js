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
 * Resend the confirmation code while signing up
 *
 * @param resendRequest - The resendRequest object
 * @returns AuthCodeDeliveryDetails
 * @throws service: {@link SignUpException } - Cognito service errors thrown during the sign-up process.
 *
 *
 * TODO: add config errors
 */

// TODO(Samaritan1011001): Function type was changed, may need API change in doc

export async function resendSignUpCode<
	PluginOptions extends CognitoResendSignUpCodeOptions = AuthPluginOptions
>(
	resendRequest: ResendSignUpCodeRequest<PluginOptions>
): Promise<AuthCodeDeliveryDetails<CognitoUserAttributeKey>> {
	const username = resendRequest.username;
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
					resendRequest.options?.pluginOptions?.clientMetadata ??
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
