// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, AuthConfig } from '@aws-amplify/core';
import { AuthAdditionalInfo, AuthDeliveryMedium } from '../../../types';
<<<<<<< Updated upstream
import {
	initiateAuth,
	respondToAuthChallenge,
} from '../utils/clients/CognitoIdentityProvider';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import {
	InitiateAuthCommandInput,
	RespondToAuthChallengeCommandInput,
} from '../utils/clients/CognitoIdentityProvider/types';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { getAuthUserAgentValue } from '../../../utils';
import {
	AuthPasswordlessDeliveryDestination,
=======
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import {
>>>>>>> Stashed changes
	AuthPasswordlessFlow,
	CognitoAuthSignInDetails,
} from '../types/models';
import { SignInWithOTPInput } from '../types/inputs';
import { SignInWithOTPOutput } from '../types/outputs';
import { setActiveSignInState } from '../utils/signInStore';
<<<<<<< Updated upstream
import {
	getActiveSignInUsername,
	setActiveSignInUsername,
} from '../utils/signInHelpers';
=======
import { getActiveSignInUsername } from '../utils/signInHelpers';
>>>>>>> Stashed changes
import { AuthPasswordlessSignInAndSignUpOptions } from '../types/options';
import {
	HttpRequest,
	unauthenticatedHandler,
	Headers,
	getRetryDecider,
	jitteredBackoff,
	HttpResponse,
	parseJsonError,
} from '@aws-amplify/core/internals/aws-client-utils';
import { normalizeHeaders } from '../utils/apiHelpers';
import { MetadataBearer } from '@aws-amplify/core/dist/esm/clients/types/aws';
<<<<<<< Updated upstream
import { AuthError } from '../../../Errors';
import { handlePasswordlessSignIn } from './passwordless';
=======
import { getDeliveryMedium, handlePasswordlessSignIn } from './passwordless';
>>>>>>> Stashed changes

export const signInWithOTP = async <
	T extends AuthPasswordlessFlow = AuthPasswordlessFlow
>(
	input: SignInWithOTPInput<T>
): Promise<SignInWithOTPOutput> => {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	console.log('authConfig in signinwithotp: ', authConfig);

	assertTokenProviderConfig(authConfig);
	const { userPoolId } = authConfig;
	const { username, flow, destination, options } = input;

	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptySignInUsername
	);

	const signInDetails: CognitoAuthSignInDetails = {
		loginId: username,
		authFlowType: 'CUSTOM_WITHOUT_SRP',
	};

	switch (flow) {
		case 'SIGN_UP_AND_SIGN_IN':
			const signUpOptions = options as AuthPasswordlessSignInAndSignUpOptions;
			const userAttributes = signUpOptions?.userAttributes;
			// creating a new user on Cognito
			// pre-auth api request
			const body: PreInitiateAuthPayload = {
				email: username,
				username: username,
				deliveryMedium: getDeliveryMedium(destination),
				region: getRegion(userPoolId),
				userPoolId: userPoolId,
				userAttributes,
			};

			const resolvedBody = body
				? body instanceof FormData
					? body
					: JSON.stringify(body ?? '')
				: undefined;

			const headers: Headers = {};

			const resolvedHeaders: Headers = {
				...normalizeHeaders(headers),
				...(resolvedBody
					? {
							'content-type':
								body instanceof FormData
									? 'multipart/form-data'
									: 'application/json; charset=UTF-8',
					  }
					: {}),
			};

			const method = 'PUT';
			// TODO: url should come from the config
			const url = new URL(
				'https://8bzzjguuck.execute-api.us-west-2.amazonaws.com/prod'
			);
			const request: HttpRequest = {
				url,
				headers: resolvedHeaders,
				method,
				body: resolvedBody,
			};
			const baseOptions = {
				retryDecider: getRetryDecider(parseApiServiceError),
				computeDelay: jitteredBackoff,
				withCrossDomainCredentials: false,
				// abortSignal,
			};

			// Default options are marked with *
			// const response = await fetch(url, {
			// 	method: 'PUT', // *GET, POST, PUT, DELETE, etc.
			// 	// mode: 'no-cors', // no-cors, *cors, same-origin
			// 	headers: resolvedHeaders,
			// 	body: resolvedBody, // body data type must match "Content-Type" header
			// });

			const response = await unauthenticatedHandler(request, {
				...baseOptions,
			});
			console.log('response: ', response);
			// api gateway response
			const preIntitiateAuthResponse = {
				username: 'Joe@example.com',
				userAttributes: {
					email: 'Joe@example.com',
					phone_number: '+15551237890',
				},
				deliveryMedium: 'SMS',
				userPoolId: 'abcde12345678',
				region: 'us-west-2',
			};
	}

	const { ChallengeParameters, Session } = await handlePasswordlessSignIn(
		input,
		authConfig as AuthConfig['Cognito']
	);

	// sets up local state used during the sign-in process
	setActiveSignInState({
		signInSession: Session,
		username: getActiveSignInUsername(username),
		signInDetails,
	});

	return {
		isSignedIn: false,
		nextStep: {
			signInStep: 'CONFIRM_SIGN_IN_WITH_OTP',
			additionalInfo: ChallengeParameters as AuthAdditionalInfo,
			codeDeliveryDetails: {
				deliveryMedium:
					ChallengeParameters?.deliveryMedium as AuthDeliveryMedium,
				destination: ChallengeParameters?.destination,
			},
		},
	};
};

type PreInitiateAuthPayload = {
	//TODO: Added this as pre auth lambda expects it to be there
	email: string;

	username: string;

	/**
	 * Any optional user attributes that were provided during sign up.
	 */
	userAttributes?: { [name: string]: string | undefined };

	/**
	 * The delivery medium for passwordless sign in. For magic link this will
	 * always be "EMAIL". For OTP, it will be the value provided by the customer.
	 */
	deliveryMedium: string;

	/**
	 * The user pool ID
	 */
	userPoolId: string;

	/**
	 * The user pool region
	 */
	region: string;
};

const parseApiServiceError = async (
	response?: HttpResponse
): Promise<(Error & MetadataBearer) | undefined> => {
	const parsedError = await parseJsonError(response);
	if (!parsedError) {
		// Response is not an error.
		return;
	}
	return Object.assign(parsedError, {
		$metadata: parsedError.$metadata,
	});
};
