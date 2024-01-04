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
import { assertServiceError } from '../../../../errors/utils/assertServiceError';
import { getRegion } from '../../utils/clients/CognitoIdentityProvider/utils';

/**
 * Internal method to create a user when signing up passwordless.
 *
 * @param createUserHandlerEndpoint The endpoint for the create user handler.
 * @param userPoolId The user pool id.
 * @param input The sign up input.
 *
 * @internal
 */
export const createUser = async (
	endpoint: URL,
	userPoolId: string,
	input:
		| SignUpWithEmailAndMagicLinkInput
		| SignUpWithEmailAndOTPInput
		| SignUpWithSMSAndOTPInput
): Promise<HttpResponse> => {
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

	const createUserHandler = composeCreateUserHandler(
		endpoint,
		getRegion(userPoolId)
	);
	return createUserHandler({}, body);
};

const createUserDeserializer = async (response: HttpResponse) => {
	if (response.statusCode >= 300) {
		// Parse error from API Gateway service itself
		const error = await parseJsonError(response);
		try {
			// Parse errors from The create user Lambda.
			const body = await parseJsonBody(response);
			if (error?.name === 'UnknownError' && body.error) {
				// Error from create user lambda returns in shape like this: {"error":"User already exists"}
				error.name = 'Error';
				error.message = body.error;
			}
		} catch (e) {
			// SKIP
		}
		assertServiceError(error);
	} else {
		const body = await parseJsonBody(response);
		return body;
	}
};

const createUserSerializer = (
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

const composeCreateUserHandler = (url: URL, region: string) =>
	composeServiceApi(
		unauthenticatedHandler,
		createUserSerializer,
		createUserDeserializer,
		{
			region,
			endpointResolver: () => ({
				url,
			}),
			retryDecider: getRetryDecider(parseJsonError),
			computeDelay: jitteredBackoff,
			withCrossDomainCredentials: false,
		}
	);
