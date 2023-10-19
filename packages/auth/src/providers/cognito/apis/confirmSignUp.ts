// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	assertTokenProviderConfig,
	AuthAction,
	HubInternal,
} from '@aws-amplify/core/internals/utils';
import { ConfirmSignUpInput, ConfirmSignUpOutput } from '../types';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { ConfirmSignUpException } from '../types/errors';
import { confirmSignUp as confirmSignUpClient } from '../utils/clients/CognitoIdentityProvider';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { AutoSignInEventData } from '../types/models';
import {
	isAutoSignInStarted,
	isAutoSignInUserUsingConfirmSignUp,
	setAutoSignInStarted,
} from '../utils/signUpHelpers';
import { getAuthUserAgentValue } from '../../../utils';
import { getUserContextData } from '../utils/userContextData';

/**
 * Confirms a new user account.
 *
 * @param input -  The ConfirmSignUpInput object.
 * @returns ConfirmSignUpOutput
 * @throws -{@link ConfirmSignUpException }
 * Thrown due to an invalid confirmation code.
 * @throws -{@link AuthValidationErrorCode }
 * Thrown due to an empty confirmation code
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function confirmSignUp(
	input: ConfirmSignUpInput
): Promise<ConfirmSignUpOutput> {
	const { username, confirmationCode, options } = input;

	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { userPoolId, userPoolClientId } = authConfig;
	const clientMetadata = options?.clientMetadata;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptyConfirmSignUpUsername
	);
	assertValidationError(
		!!confirmationCode,
		AuthValidationErrorCode.EmptyConfirmSignUpCode
	);

	const UserContextData = getUserContextData({
		username,
		userPoolId,
		userPoolClientId,
	});

	await confirmSignUpClient(
		{
			region: getRegion(authConfig.userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.ConfirmSignUp),
		},
		{
			Username: username,
			ConfirmationCode: confirmationCode,
			ClientMetadata: clientMetadata,
			ForceAliasCreation: options?.forceAliasCreation,
			ClientId: authConfig.userPoolClientId,
			UserContextData,
		}
	);

	return new Promise((resolve, reject) => {
		try {
			const signUpOut: ConfirmSignUpOutput = {
				isSignUpComplete: true,
				nextStep: {
					signUpStep: 'DONE',
				},
			};

			if (
				!isAutoSignInStarted() ||
				!isAutoSignInUserUsingConfirmSignUp(username)
			) {
				return resolve(signUpOut);
			}

			const stopListener = HubInternal.listen<AutoSignInEventData>(
				'auth-internal',
				({ payload }) => {
					switch (payload.event) {
						case 'autoSignIn':
							resolve({
								isSignUpComplete: true,
								nextStep: {
									signUpStep: 'COMPLETE_AUTO_SIGN_IN',
								},
							});
							setAutoSignInStarted(false);
							stopListener();
					}
				}
			);

			HubInternal.dispatch('auth-internal', {
				event: 'confirmSignUp',
				data: signUpOut,
			});
		} catch (error) {
			reject(error);
		}
	});
}
