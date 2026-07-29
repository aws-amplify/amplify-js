// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import {
	PushNotificationError,
	PushNotificationValidationErrorCode,
	assert,
} from '../../../errors';

/**
 * Path of the identify-user route on the Amazon Connect Customer Profiles REST
 * endpoint. Associates the caller's `userProfile` with their Customer Profile.
 * The backend derives `principalId` server-side from the SigV4 signer identity.
 *
 * @internal
 */
export const IDENTIFY_USER_PATH = '/identify-user';

/**
 * Path of the register-device route. Registers (upserts) a push device object,
 * keyed on the caller's server-derived `principalId`.
 *
 * @internal
 */
export const REGISTER_DEVICE_PATH = '/register-device';

/**
 * Path of the remove-device route. De-registers a push device object. The
 * backend gates removal on the caller's server-derived `principalId`.
 *
 * @internal
 */
export const REMOVE_DEVICE_PATH = '/remove-device';

const escapeRegExp = (value: string) =>
	value.replace(/[.*+?^${}()|[\]\\]/g, matched => `\\${matched}`);

/**
 * Requests to the configured endpoint are SigV4-signed for `execute-api`, so the
 * host is restricted to the API Gateway host of the resolved region —
 * `<api-id>.execute-api.<region>.amazonaws.com`. Without this, a misconfigured
 * or attacker-supplied endpoint would receive the signed credentials.
 */
const buildAllowedHostRegExp = (region: string) =>
	new RegExp(
		`^[a-z0-9-]+\\.execute-api\\.${escapeRegExp(region)}\\.amazonaws\\.com$`,
	);

/**
 * @internal
 */
export const resolveConfig = () => {
	const { endpoint, region } =
		Amplify.getConfig().Notifications?.PushNotification?.CustomerProfiles ?? {};
	assert(!!endpoint, PushNotificationValidationErrorCode.NoEndpoint);
	assert(!!region, PushNotificationValidationErrorCode.NoRegion);

	let parsedEndpoint: URL;
	try {
		parsedEndpoint = new URL(endpoint);
	} catch (underlyingError) {
		throw new PushNotificationError({
			name: PushNotificationValidationErrorCode.InvalidEndpoint,
			message: 'The configured Customer Profiles endpoint is invalid.',
			recoverySuggestion:
				'Ensure the endpoint in your Amplify configuration is a valid https:// URL on the API Gateway host for the configured region, for example https://<api-id>.execute-api.<region>.amazonaws.com.',
			underlyingError,
		});
	}
	assert(
		parsedEndpoint.protocol === 'https:',
		PushNotificationValidationErrorCode.InvalidEndpoint,
	);
	assert(
		buildAllowedHostRegExp(region).test(parsedEndpoint.hostname),
		PushNotificationValidationErrorCode.InvalidEndpoint,
	);

	// Only trailing slashes are stripped, so `{endpoint}{path}` never produces a
	// double slash. `origin` is deliberately not used: it would drop an API
	// Gateway stage path such as `/prod`.
	return {
		endpoint: parsedEndpoint.href.replace(/\/+$/, ''),
		region,
	};
};
