// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserProfile } from '@aws-amplify/core';
import { signRequest } from '@aws-amplify/core/internals/aws-client-utils';

import { PushNotificationError } from '../../../errors';
import { ChannelType, IdentifyUserOptions } from '../types';

import { getDeviceId } from './getDeviceId';
import {
	GUEST_IDENTIFY_USER_PATH,
	IDENTIFY_USER_PATH,
	resolveConfig,
} from './resolveConfig';
import { resolveCredentials } from './resolveCredentials';

const CONTENT_TYPE = 'application/json';
const SIGNING_SERVICE = 'execute-api';

export interface RegisterDeviceInput {
	deviceToken?: string;
	channelType: ChannelType;
	userId?: string;
	userProfile?: UserProfile;
	options?: IdentifyUserOptions;
}

/**
 * Registers a push-notification device (and, optionally, the identifying user
 * information) with the Amazon Connect Customer Profiles endpoint.
 *
 * Two authorization modes are supported, selected automatically from the
 * resolved auth session:
 *  - Authenticated (Cognito user-pool): `POST {endpoint}/identify-user` with
 *    header `Authorization: Bearer <accessToken>`. The backend keys the profile
 *    on the token's verified `sub`.
 *  - Guest (Identity Pool unauthenticated): `POST {endpoint}/identify-user-guest`
 *    SigV4-signed (`execute-api`) with the guest credentials. The backend keys
 *    the profile on the caller's Identity Pool `identityId`, enabling a device
 *    token to be registered before sign-in. On a later authenticated call, pass
 *    the prior guest `identityId` via `options.previousGuestIdentityId` to fold
 *    the guest profile (and its devices) into the authenticated profile.
 *
 * @throws service/network: {@link PushNotificationError} - Thrown when the
 *  request cannot be completed or the endpoint responds with a non-2xx status.
 *
 * @internal
 */
export const registerDeviceWithCustomerProfiles = async ({
	deviceToken,
	channelType,
	userId,
	userProfile,
	options,
}: RegisterDeviceInput): Promise<void> => {
	const { endpoint, region } = resolveConfig();
	const { token, credentials } = await resolveCredentials();

	// Device-registration fields are nested under `options` to match the
	// backend `IdentifyUserRequest` contract: the endpoint keys the device
	// object on `options.deviceId`, reads the token from `options.address`, and
	// the push-capability channel from `options.channelType`. A stable per-install
	// `deviceId` is resolved (and persisted) when the caller does not supply one,
	// so token refreshes upsert the same device object instead of duplicating it.
	const deviceId = options?.deviceId ?? (await getDeviceId());
	const body = JSON.stringify({
		userId,
		userProfile: userProfile ?? {},
		options: {
			...options,
			deviceId,
			address: deviceToken,
			channelType,
		},
	});

	let response: Response;
	try {
		if (token) {
			// Authenticated (user-pool) path — bearer token.
			response = await fetch(`${endpoint}${IDENTIFY_USER_PATH}`, {
				method: 'POST',
				headers: {
					'Content-Type': CONTENT_TYPE,
					Authorization: `Bearer ${token}`,
				},
				body,
			});
		} else {
			// Guest (Identity Pool) path — SigV4-signed with the guest credentials.
			// Reuses the same signer the API/Storage categories use so guest
			// requests are signed identically to authenticated IAM requests.
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
			name: 'DeviceRegistrationException',
			message: `Failed to register the device with Amazon Connect Customer Profiles. The endpoint responded with status ${response.status}.`,
			recoverySuggestion:
				'Ensure the configured Customer Profiles endpoint is reachable and that the request is authorized.',
		});
	}
};
