// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, Hub } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';
import { ConfirmSignUpInput, ConfirmSignUpOutput } from '../types';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { ConfirmSignUpException } from '../types/errors';
import { confirmSignUp as confirmSignUpClient } from '../utils/clients/CognitoIdentityProvider';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { AutoSignInEventData } from '../types/models';

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
	const clientMetadata = options?.serviceOptions?.clientMetadata;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptyConfirmSignUpUsername
	);
	assertValidationError(
		!!confirmationCode,
		AuthValidationErrorCode.EmptyConfirmSignUpCode
	);

	await confirmSignUpClient(
		{ region: getRegion(authConfig.userPoolId) },
		{
			Username: username,
			ConfirmationCode: confirmationCode,
			ClientMetadata: clientMetadata,
			ForceAliasCreation: options?.serviceOptions?.forceAliasCreation,
			ClientId: authConfig.userPoolClientId,
			// TODO: handle UserContextData
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
			const autoSignIn = localStorage.getItem('amplify-auto-sign-in');
			if (!autoSignIn) return resolve(signUpOut);

			Hub.dispatch<AutoSignInEventData>('auth-internal', {
				event: 'confirmSignUp',
				data: signUpOut,
			});

			const stopListener = Hub.listen<AutoSignInEventData>(
				'auth-internal',
				({ payload }) => {
					switch (payload.event) {
						case 'autoSignIn':
							resolve({
								isSignUpComplete: true,
								nextStep: {
									signUpStep: 'DONE',
									autoSignIn: async () => {
										const output = payload.data.output;
										const error = payload.data.error;
										if (!output && error) {
											throw error;
										}
										return output!;
									},
								},
							});
							localStorage.removeItem('amplify-auto-sign-in');
							stopListener();
					}
				}
			);
		} catch (error) {
			reject(error);
		}
	});
}
