// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, Hub } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';
import { AuthDeliveryMedium } from '../../../types';
import {
	UserAttributeKey,
	SignUpInput,
	SignUpOutput,
	SignInOutput,
	SignInInput,
} from '../types';
import { signUp as signUpClient } from '../utils/clients/CognitoIdentityProvider';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { SignUpException } from '../types/errors';
import { AttributeType } from '../utils/clients/CognitoIdentityProvider/types';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { toAttributeType } from '../utils/apiHelpers';
import { signIn } from './signIn';
import { AuthError } from '../../../errors/AuthError';
import { AutoSignInCallback } from '../../../types/models';
import { AutoSignInEventData } from '../types/models';

const MAX_AUTOSIGNIN_POLLING_MS = 3 * 60 * 1000;
/**
 * Creates a user
 *
 * @param input - The SignUpInput object
 * @returns SignUpOutput
 * @throws service: {@link SignUpException } - Cognito service errors thrown during the sign-up process.
 * @throws validation: {@link AuthValidationErrorCode } - Validation errors thrown either username or password
 *  are not defined.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function signUp(input: SignUpInput): Promise<SignUpOutput> {
	const { username, password, options } = input;
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	const signUpVerificationMethod =
		authConfig?.signUpVerificationMethod ?? 'code';
	const clientMetadata = input.options?.serviceOptions?.clientMetadata;
	assertTokenProviderConfig(authConfig);
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
	const signInServiceOptions = options?.serviceOptions?.autoSignIn;
	const signInInput: SignInInput = {
		username,
		password,
		options: {
			serviceOptions: signInServiceOptions,
		},
	};

	const { UserConfirmed, CodeDeliveryDetails, UserSub } = await signUpClient(
		{ region: getRegion(authConfig.userPoolId) },
		{
			Username: username,
			Password: password,
			UserAttributes: attributes,
			ClientMetadata: clientMetadata,
			ValidationData: validationData,
			ClientId: authConfig.userPoolClientId,
		}
	);

	if (UserConfirmed && signInServiceOptions) {
		return {
			isSignUpComplete: true,
			nextStep: {
				signUpStep: 'DONE',
				autoSignIn: async () => signIn(signInInput),
			},
		};
	} else if (
		!UserConfirmed &&
		signInServiceOptions &&
		signUpVerificationMethod &&
		signUpVerificationMethod === 'code'
	) {
		localStorage.setItem('amplify-auto-sign-in', 'true');
		handleCodeAutoSignIn(signInInput);
		return {
			isSignUpComplete: false,
			nextStep: {
				signUpStep: 'CONFIRM_SIGN_UP',
				codeDeliveryDetails: {
					deliveryMedium:
						CodeDeliveryDetails?.DeliveryMedium as AuthDeliveryMedium,
					destination: CodeDeliveryDetails?.Destination as string,
					attributeName: CodeDeliveryDetails?.AttributeName as UserAttributeKey,
				},
			},
			userId: UserSub,
		};
	} else if (
		!UserConfirmed &&
		signInServiceOptions &&
		signUpVerificationMethod &&
		signUpVerificationMethod === 'link'
	) {
		localStorage.setItem('amplify-auto-sign-in', 'true');

		return {
			isSignUpComplete: false,
			nextStep: {
				signUpStep: 'CONFIRM_SIGN_UP',
				codeDeliveryDetails: {
					deliveryMedium:
						CodeDeliveryDetails?.DeliveryMedium as AuthDeliveryMedium,
					destination: CodeDeliveryDetails?.Destination as string,
					attributeName: CodeDeliveryDetails?.AttributeName as UserAttributeKey,
				},

				autoSignIn: getAutoSignOutput(signInInput),
			},
			userId: UserSub,
		};
	}

	return {
		isSignUpComplete: false,
		nextStep: {
			signUpStep: 'CONFIRM_SIGN_UP',
			codeDeliveryDetails: {
				deliveryMedium:
					CodeDeliveryDetails?.DeliveryMedium as AuthDeliveryMedium,
				destination: CodeDeliveryDetails?.Destination as string,
				attributeName: CodeDeliveryDetails?.AttributeName as UserAttributeKey,
			},
		},
		userId: UserSub,
	};
}

function getAutoSignOutput(signInInput: SignInInput): AutoSignInCallback {
	return async () => {
		return new Promise<SignInOutput>(async (resolve, reject) => {
			const start = Date.now();
			let signInOutput: SignInOutput;
			const autoSignInPollingIntervalId = setInterval(async () => {
				if (Date.now() - start > MAX_AUTOSIGNIN_POLLING_MS) {
					clearInterval(autoSignInPollingIntervalId);
					localStorage.removeItem('amplify-auto-sign-in');

					reject(
						new AuthError({
							name: 'AutoSignInError',
							message: 'the account was not confirmed on time.',
						})
					);
				} else {
					try {
						if (signInOutput) return;
						const output = await signIn(signInInput);
						if (output.nextStep.signInStep !== 'CONFIRM_SIGN_UP') {
							signInOutput = output;
							resolve(signInOutput);
							clearInterval(autoSignInPollingIntervalId);
							localStorage.removeItem('amplify-auto-sign-in');
						}
					} catch (error) {
						clearInterval(autoSignInPollingIntervalId);
						localStorage.removeItem('amplify-auto-sign-in');
						reject(error);
					}
				}
			}, 5000);
		});
	};
}

function handleCodeAutoSignIn(signInInput: SignInInput) {
	const stopHubListener = Hub.listen<AutoSignInEventData>(
		'auth-internal',
		async ({ payload }) => {
			switch (payload.event) {
				case 'confirmSignUp': {
					const response = payload.data;
					let signInError: unknown;
					let signInOutput: SignInOutput | undefined;
					if (response?.isSignUpComplete) {
						try {
							signInOutput = await signIn(signInInput);
						} catch (error) {
							signInError = error;
						}
						Hub.dispatch<AutoSignInEventData>('auth-internal', {
							event: 'autoSignIn',
							data: {
								error: signInError,
								output: signInOutput,
							},
						});
						stopHubListener();
					}
				}
			}
		}
	);
}
