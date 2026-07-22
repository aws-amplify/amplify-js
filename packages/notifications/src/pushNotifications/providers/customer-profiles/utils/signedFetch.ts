// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { signRequest } from '@aws-amplify/core/internals/aws-client-utils';
import {
	Category,
	PushNotificationAction,
	getAmplifyUserAgent,
} from '@aws-amplify/core/internals/utils';

import { PushNotificationError } from '../../../errors';

import { resolveConfig } from './resolveConfig';
import { resolveCredentials } from './resolveCredentials';

const CONTENT_TYPE = 'application/json';
const SIGNING_SERVICE = 'execute-api';
const USER_AGENT_HEADER = 'x-amz-user-agent';

/**
 * SigV4-signs (`execute-api`) and POSTs a JSON body to `{endpoint}{path}` on the
 * Amazon Connect Customer Profiles REST endpoint. A single signer serves all
 * three routes for both authenticated and guest callers — the Identity Pool
 * credentials resolved from the current auth session are used to sign, and the
 * backend derives `principalId` from the signer identity.
 *
 * @throws service/network: {@link PushNotificationError} - Thrown when the
 *  request cannot be completed or the endpoint responds with a non-2xx status.
 *
 * @internal
 */
export const signedFetch = async (
	path: string,
	body: unknown,
	action: PushNotificationAction,
): Promise<void> => {
	const { endpoint, region } = resolveConfig();
	const { credentials } = await resolveCredentials();

	const serializedBody = JSON.stringify(body);
	const url = new URL(`${endpoint}${path}`);
	const signed = signRequest(
		{
			method: 'POST',
			url,
			headers: {
				'content-type': CONTENT_TYPE,
				// Attach the Amplify telemetry user-agent BEFORE signing so it is
				// covered by the SigV4 signature and the sent headers match.
				[USER_AGENT_HEADER]: getAmplifyUserAgent({
					category: Category.PushNotification,
					action,
				}),
			},
			body: serializedBody,
		},
		{
			credentials,
			signingRegion: region,
			signingService: SIGNING_SERVICE,
		},
	);

	let response: Response;
	try {
		response = await fetch(url.toString(), {
			method: 'POST',
			headers: signed.headers,
			body: serializedBody,
		});
	} catch (underlyingError) {
		throw new PushNotificationError({
			name: 'NetworkException',
			message:
				'The request to the Amazon Connect Customer Profiles endpoint failed to complete.',
			recoverySuggestion:
				'Check your network connection and ensure the configured Customer Profiles endpoint is reachable.',
			underlyingError,
		});
	}

	if (!response.ok) {
		throw new PushNotificationError({
			name: 'ServiceException',
			message: `The Amazon Connect Customer Profiles endpoint responded with status ${response.status}.`,
			recoverySuggestion:
				'Ensure the configured Customer Profiles endpoint is reachable and that the request is authorized.',
		});
	}
};
