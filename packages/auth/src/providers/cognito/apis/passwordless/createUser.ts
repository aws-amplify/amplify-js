// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	HttpRequest,
	unauthenticatedHandler,
	getRetryDecider,
	parseJsonError,
	jitteredBackoff,
} from '@aws-amplify/core/internals/aws-client-utils';
import { PreInitiateAuthPayload } from './types';
import {
	SignUpWithEmailAndMagicLinkInput,
	SignUpWithEmailAndOTPInput,
	SignUpWithSMSAndOTPInput,
} from '../../types';
import {
	isSignUpWithEmailAndMagicLinkInput,
	isSignUpWithEmailAndOTPInput,
	isSignUpWithSMSAndOTPInput,
} from '../../utils/signUpHelpers';

/**
 * Internal method to create a user when signing up passwordless.
 */
export const createUser = async (
	createUserHandlerEndpoint: URL,
	userPoolId: string,
	input:
		| SignUpWithEmailAndMagicLinkInput
		| SignUpWithEmailAndOTPInput
		| SignUpWithSMSAndOTPInput
) => {
	const { username } = input;

	// pre-auth api request
	const body: PreInitiateAuthPayload = {
		...((isSignUpWithEmailAndMagicLinkInput(input) ||
			isSignUpWithEmailAndOTPInput(input)) && {
			email: input.options.userAttributes.email,
		}),
		...(isSignUpWithSMSAndOTPInput(input) && {
			phoneNumber: input.options.userAttributes.phone_number,
		}),
		username: username,
		userPoolId: userPoolId,
	};

	const request: HttpRequest = {
		url: createUserHandlerEndpoint,
		headers: {
			'content-type': 'application/json; charset=UTF-8',
		},
		method: 'PUT',
		body: JSON.stringify(body),
	};

	// creating a new user on Cognito via API endpoint
	return unauthenticatedHandler(request, {
		// TODO: confirm the error shape thrown by the create user Lambda
		// TODO: expose the error message and code if the error shape does not follow the AWS service error shape.
		retryDecider: getRetryDecider(parseJsonError),
		computeDelay: jitteredBackoff,
		withCrossDomainCredentials: false,
	});
};
