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
	const signUpVerificationMethod = authConfig?.signUpVerificationMethod;
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
	return new Promise(async (resolve, reject) => {
		try {
			const { UserConfirmed, CodeDeliveryDetails, UserSub } =
				await signUpClient(
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
			if (UserConfirmed && !signInServiceOptions) {
				resolve({
					isSignUpComplete: true,
					nextStep: {
						signUpStep: 'DONE',
					},
				});
			} else if (!UserConfirmed && !signInServiceOptions) {
				resolve({
					isSignUpComplete: false,
					nextStep: {
						signUpStep: 'CONFIRM_SIGN_UP',
						codeDeliveryDetails: {
							deliveryMedium:
								CodeDeliveryDetails?.DeliveryMedium as AuthDeliveryMedium,
							destination: CodeDeliveryDetails?.Destination as string,
							attributeName:
								CodeDeliveryDetails?.AttributeName as UserAttributeKey,
						},
					},
					userId: UserSub,
				});
			} else if (UserConfirmed && signInServiceOptions) {
				await handleAutoSignIn({
					userId: UserSub,
					signInInput,
					resolve,
					reject,
				});
			} else if (
				!UserConfirmed &&
				signInServiceOptions &&
				signUpVerificationMethod &&
				signUpVerificationMethod === 'code'
			) {
				localStorage.setItem('amplify-auto-sign-in', 'true');
				handleCodeAutoSignIn(signInInput);
				resolve({
					isSignUpComplete: false,
					nextStep: {
						signUpStep: 'CONFIRM_SIGN_UP',
						codeDeliveryDetails: {
							deliveryMedium:
								CodeDeliveryDetails?.DeliveryMedium as AuthDeliveryMedium,
							destination: CodeDeliveryDetails?.Destination as string,
							attributeName:
								CodeDeliveryDetails?.AttributeName as UserAttributeKey,
						},
					},
					userId: UserSub,
				});
			} else if (
				!UserConfirmed &&
				signInServiceOptions &&
				signUpVerificationMethod &&
				signUpVerificationMethod === 'link'
			) {
				localStorage.setItem('amplify-auto-sign-in', 'true');

				resolve({
					isSignUpComplete: false,
					nextStep: {
						signUpStep: 'AUTO_SIGN_IN_WITH_LINK',
						codeDeliveryDetails: {
							deliveryMedium:
								CodeDeliveryDetails?.DeliveryMedium as AuthDeliveryMedium,
							destination: CodeDeliveryDetails?.Destination as string,
							attributeName:
								CodeDeliveryDetails?.AttributeName as UserAttributeKey,
						},
						fetchSignInOutput: () =>
							new Promise((resolve, reject) => {
								handleLinkAutoSignIn({
									signInInput,
									resolve,
									reject,
								});
							}),
					},
					userId: UserSub,
				});
			}
		} catch (e) {
			reject(e);
		}
	});
}

function handleLinkAutoSignIn({
	signInInput,
	resolve,
	reject,
}: AutoSignInViaLinkParams) {
	localStorage.setItem('amplify-polling-started', 'true');
	const start = Date.now();
	const autoSignInPollingIntervalId = setInterval(async () => {
		if (Date.now() - start > MAX_AUTOSIGNIN_POLLING_MS) {
			clearInterval(autoSignInPollingIntervalId);
			reject(
				new AuthError({
					name: 'AutoSignInError',
					message: 'error while autoSignIn via link',
				})
			);
			localStorage.removeItem('amplify-auto-sign-in');
		} else {
			try {
				const output = await signIn(signInInput);
				if (output.nextStep.signInStep !== 'CONFIRM_SIGN_UP') {
					clearInterval(autoSignInPollingIntervalId);
					resolve(output);
				}
			} catch (error) {
				// TODO: log error
			}
		}
	}, 5000);
}
type RejectPromise = (reason?: unknown) => void;
type SignInResolvePromise = (
	value: SignInOutput | PromiseLike<SignInOutput>
) => void;
type SignUpResolvePromise = (
	value: SignUpOutput | PromiseLike<SignUpOutput>
) => void;
type AutoSignInParams = {
	signInInput: SignInInput;
	userId?: string;
	resolve: SignUpResolvePromise;
	reject: RejectPromise;
};
type AutoSignInViaLinkParams = {
	signInInput: SignInInput;
	resolve: SignInResolvePromise;
	reject: RejectPromise;
};
export type AutoSignInEventData =
	| {
			event: 'confirmSignUp';
			data: { response?: SignUpOutput };
	  }
	| {
			event: 'autoSignIn';
			data: { response?: SignInOutput; error?: unknown };
	  };

async function handleAutoSignIn({
	signInInput,
	userId,
	resolve,
	reject,
}: AutoSignInParams) {
	try {
		const output = await signIn(signInInput);
		resolve({
			isSignUpComplete: true,
			userId,
			nextStep: {
				signUpStep: 'AUTO_SIGN_IN',
				nextSignInStep: output.nextStep,
			},
		});
	} catch (error) {
		reject(error);
	}
}

function handleCodeAutoSignIn(signInInput: SignInInput) {
	const stopHubListener = Hub.listen<AutoSignInEventData>(
		'auth-internal',
		async ({ payload }) => {
			switch (payload.event) {
				case 'confirmSignUp': {
					const response = payload.data.response;
					if (response?.isSignUpComplete) {
						try {
							const output = await signIn(signInInput);

							Hub.dispatch<AutoSignInEventData>('auth-internal', {
								event: 'autoSignIn',
								data: { response: output },
							});
							stopHubListener();
						} catch (error) {
							Hub.dispatch<AutoSignInEventData>('auth-internal', {
								event: 'autoSignIn',
								data: { error },
							});
							stopHubListener();
						}
					}
				}
			}
		}
	);
}
