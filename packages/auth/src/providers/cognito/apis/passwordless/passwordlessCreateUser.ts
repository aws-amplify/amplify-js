// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	HttpRequest,
	unauthenticatedHandler,
	Headers,
	getRetryDecider,
	jitteredBackoff,
} from '@aws-amplify/core/internals/aws-client-utils';
import { normalizeHeaders } from "../../utils/apiHelpers";
import { getDeliveryMedium, parseApiServiceError } from "./utils";
import { getRegion } from "../../utils/clients/CognitoIdentityProvider/utils";
import { AuthUserAttributes } from "../../../../types";
import { PreInitiateAuthPayload, PasswordlessSignUpPayload } from './types';

/**
 * Internal method to create a user when signing up passwordless.
 */
export async function createUserForPasswordlessSignUp(
	payload: PasswordlessSignUpPayload,
	userPoolId: string,
	userAttributes?: AuthUserAttributes
	){

		const { email, phone_number, username, destination} = payload
				
		// pre-auth api request
		const body: PreInitiateAuthPayload = {
			phone_number: phone_number,
			email: email,
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
		};

		// creating a new user on Cognito via API endpoint
		return await unauthenticatedHandler(request, {
			...baseOptions,
		});
}
