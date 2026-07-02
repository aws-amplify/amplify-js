// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnalyticsError } from '../../../errors';
import { IdentifyUserInput } from '../types';
import { resolveConfig, resolveCredentials } from '../utils';

/**
 * Sends information about a user to the Amazon Connect Customer Profiles
 * endpoint. Sending user information allows you to associate a user with their
 * Customer Profile so that activity can be tracked across devices & platforms
 * by using the same `userId`.
 *
 * The request is a plain REST call authenticated with the caller's Cognito
 * user-pool access token:
 *
 * `POST {endpoint}/identify-user` with header `Authorization: Bearer <token>`.
 *
 * @param {IdentifyUserInput} params The input object used to construct the
 *  request sent to the Customer Profiles endpoint.
 *
 * @throws validation: {@link AnalyticsError} - Thrown when the provided
 *  parameters or library configuration is incorrect, or when the Cognito
 *  user-pool token cannot be resolved.
 * @throws service: {@link AnalyticsError} - Thrown when the endpoint responds
 *  with a non-2xx status code.
 *
 * @returns A promise that will resolve when the operation is complete.
 *
 * @example
 * ```ts
 * // Identify a user with Amazon Connect Customer Profiles
 * await identifyUser({
 *     userId,
 *     userProfile: {
 *         email: 'userEmail@example.com',
 *         customProperties: {
 *             phoneNumber: ['555-555-5555'],
 *         },
 *     },
 * });
 * ```
 */
export const identifyUser = async ({
	userId,
	userProfile,
	options,
}: IdentifyUserInput): Promise<void> => {
	const { endpoint } = resolveConfig();
	const { token } = await resolveCredentials();

	let response: Response;
	try {
		response = await fetch(`${endpoint}/identify-user`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ userId, userProfile, options }),
		});
	} catch (error) {
		throw new AnalyticsError({
			name: 'NetworkException',
			message:
				'The request to the Amazon Connect Customer Profiles endpoint failed to complete.',
			recoverySuggestion:
				'Check your network connection and ensure the configured Customer Profiles endpoint is reachable.',
			underlyingError: error,
		});
	}

	if (!response.ok) {
		throw new AnalyticsError({
			name: 'IdentifyUserException',
			message: `Failed to identify user with Amazon Connect Customer Profiles. The endpoint responded with status ${response.status}.`,
			recoverySuggestion:
				'Ensure the configured Customer Profiles endpoint is reachable and that the request is authorized.',
		});
	}
};
