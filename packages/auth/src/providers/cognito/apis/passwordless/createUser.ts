// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Endpoint,
	HttpResponse,
	getRetryDecider,
	jitteredBackoff,
	parseJsonBody,
	parseJsonError,
	unauthenticatedHandler,
} from '@aws-amplify/core/internals/aws-client-utils';
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { AuthError } from '../../../../errors/AuthError';
import {
	SignUpWithEmailAndMagicLinkInput,
	SignUpWithEmailAndOTPInput,
	SignUpWithSMSAndOTPInput,
} from '../../types';
import { PreInitiateAuthPayload } from './types';
import {
	isSignUpWithEmailAndMagicLinkInput,
	isSignUpWithEmailAndOTPInput,
	isSignUpWithSMSAndOTPInput,
} from './utils';

const createUserApiHandlerDeserializer = async (response: HttpResponse) => {
	if (response.statusCode >= 300) {
		// Parse error from API Gateway service itself
		const error = await parseJsonError(response);
		try {
			// Parse errors from The create user Lambda.
			const body = await parseJsonBody(response);
			if (error?.name === 'UnknownError' && body.error) {
				// Error from create user lambda returns in shape like this:
				// {"error":"User already exists"}
				error.name = 'CreateUserError';
				error.message = body.error;
			}
		} catch (e) {
			/** SKIP */
		}
		throw new AuthError({ name: error!.name, message: error!.message });
	} else {
		const body = await parseJsonBody(response);
		return body;
	}
};

const createUserApiHandlerSerializer = (
	input: PreInitiateAuthPayload,
	endpoint: Endpoint
) => ({
	url: endpoint.url,
	headers: {
		'content-type': 'application/json; charset=UTF-8',
	},
	method: 'PUT',
	body: JSON.stringify(input),
});

const getCreateUserApiHandler = (url: URL) =>
	composeServiceApi(
		unauthenticatedHandler,
		createUserApiHandlerSerializer,
		createUserApiHandlerDeserializer,
		{
			region: '',
			endpointResolver: () => ({
				url,
			}),
			retryDecider: getRetryDecider(parseJsonError),
			computeDelay: jitteredBackoff,
			withCrossDomainCredentials: false,
		}
	);

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

	// creating a new user on Cognito via API endpoint
	const handleCreateUser = getCreateUserApiHandler(createUserHandlerEndpoint);
	return handleCreateUser({}, body);
};
