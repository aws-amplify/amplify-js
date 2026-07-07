// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { signRequest } from '@aws-amplify/core/internals/aws-client-utils';

import { AnalyticsError } from '../../../errors';
import { IdentifyUserInput } from '../types';
import {
	GUEST_IDENTIFY_USER_PATH,
	IDENTIFY_USER_PATH,
	resolveConfig,
	resolveCredentials,
} from '../utils';

const CONTENT_TYPE = 'application/json';
const SIGNING_SERVICE = 'execute-api';

/**
 * Sends information about a user to the Amazon Connect Customer Profiles
 * endpoint. Sending user information allows you to associate a user with their
 * Customer Profile so that activity can be tracked across devices & platforms
 * by using the same `userId`.
 *
 * Two authorization modes are supported, selected automatically from the
 * resolved auth session:
 *
 *  - Authenticated (Cognito user-pool): `POST {endpoint}/identify-user` with
 *    header `Authorization: Bearer <accessToken>`. The profile is keyed on the
 *    caller's `cognitoSub`.
 *  - Guest (Identity Pool unauthenticated): `POST {endpoint}/identify-user-guest`
 *    SigV4-signed (`execute-api`) with the guest credentials. The profile is
 *    keyed on the caller's Identity Pool `identityId` — enabling pre-login use
 *    cases such as registering a push-notification device token before sign-in.
 *
 * On sign-in, pass the prior guest `identityId` via
 * `options.previousGuestIdentityId` on an authenticated call to fold the guest
 * profile (and its devices) into the authenticated profile.
 *
 * @param {IdentifyUserInput} params The input object used to construct the
 *  request sent to the Customer Profiles endpoint.
 *
 * @throws validation: {@link AnalyticsError} - Thrown when the provided
 *  parameters or library configuration is incorrect, or when neither a Cognito
 *  user-pool token nor guest credentials can be resolved.
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
	const { endpoint, region } = resolveConfig();
	const { token, credentials } = await resolveCredentials();

	const body = JSON.stringify({ userId, userProfile, options });

	let response: Response;
	try {
		if (token) {
			response = await fetch(`${endpoint}${IDENTIFY_USER_PATH}`, {
				method: 'POST',
				headers: {
					'Content-Type': CONTENT_TYPE,
					Authorization: `Bearer ${token}`,
				},
				body,
			});
		} else {
			// Guest (Identity Pool) path: SigV4-sign with the guest credentials
			// using the shared signer so the request is authorized identically
			// to any other IAM (`execute-api`) request.
			const url = new URL(`${endpoint}${GUEST_IDENTIFY_USER_PATH}`);
			const signed = signRequest(
				{
					method: 'POST',
					url,
					headers: { 'content-type': CONTENT_TYPE },
					body,
				},
				{
					credentials: credentials!,
					signingRegion: region,
					signingService: SIGNING_SERVICE,
				},
			);
			response = await fetch(url.toString(), {
				method: 'POST',
				headers: signed.headers,
				body,
			});
		}
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
