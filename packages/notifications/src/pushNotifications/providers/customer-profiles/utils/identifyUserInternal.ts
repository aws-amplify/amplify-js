// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserProfile } from '@aws-amplify/core';
import { signRequest } from '@aws-amplify/core/internals/aws-client-utils';

import { PushNotificationError } from '../../../errors';
import { ChannelType, IdentifyUserOptions } from '../types';

import {
	GUEST_IDENTIFY_USER_PATH,
	IDENTIFY_USER_PATH,
	resolveConfig,
} from './resolveConfig';
import { resolveCredentials } from './resolveCredentials';

const CONTENT_TYPE = 'application/json';
const SIGNING_SERVICE = 'execute-api';

export interface IdentifyUserInternalInput {
	deviceToken?: string;
	channelType?: ChannelType;
	userId?: string;
	userProfile?: UserProfile;
	options?: IdentifyUserOptions;
}

/**
 * Sends an identify-user request to the Amazon Connect Customer Profiles
 * endpoint. This is the single transport-agnostic engine behind the CP
 * provider — mirroring how the Pinpoint provider funnels both device-token
 * registration and explicit user identification through `updateEndpoint`.
 *
 * Two callers converge here:
 *  - Device-token registration (native `TOKEN_RECEIVED` and `identifyUser`):
 *    a `deviceToken` (and `channelType`) is supplied, so the device object is
 *    registered. The stable per-install `deviceId` (find-or-create key) is
 *    resolved and persisted by the native caller and passed in via
 *    `options.deviceId`, so token refreshes upsert the same device object
 *    instead of duplicating it. The device fields are nested under `options`
 *    to match the backend `IdentifyUserRequest` contract: the endpoint keys
 *    the device object on `options.deviceId`, reads the token from
 *    `options.address`, and the push-capability channel from
 *    `options.channelType`.
 *  - Device-less profile identify (browser/web `identifyUser`): no
 *    `deviceToken` is supplied, so NO device fields are attached. This engine
 *    imports NO React-Native-only module (`getDeviceId` is resolved entirely
 *    in the `.native` callers and injected), so the web bundle stays free of
 *    `@aws-amplify/react-native` with neither a static nor a dynamic import.
 *    The request body is simply `{ userId, userProfile, options }`,
 *    associating the user's profile without registering a device.
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
export const identifyUserInternal = async ({
	deviceToken,
	channelType,
	userId,
	userProfile,
	options,
}: IdentifyUserInternalInput): Promise<void> => {
	const { endpoint, region } = resolveConfig();
	const { token, credentials } = await resolveCredentials();

	const resolvedOptions = resolveRequestOptions({
		deviceToken,
		channelType,
		options,
	});
	const body = JSON.stringify({
		userId,
		userProfile: userProfile ?? {},
		options: resolvedOptions,
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
			name: 'IdentifyUserException',
			message: `Failed to identify the user with Amazon Connect Customer Profiles. The endpoint responded with status ${response.status}.`,
			recoverySuggestion:
				'Ensure the configured Customer Profiles endpoint is reachable and that the request is authorized.',
		});
	}
};

/**
 * Builds the `options` object for the request body. When a device token is
 * being registered, the device-registration fields (`address`, `channelType`)
 * are attached alongside the caller-resolved stable `deviceId` (find-or-create
 * key, supplied via `options.deviceId` by the native caller). When no device
 * token is present (device-less web identify), the caller-supplied `options`
 * are passed through unchanged. This engine imports no React-Native-only
 * module (`getDeviceId`), so the web bundle stays free of
 * `@aws-amplify/react-native` — no static and no dynamic import.
 */
const resolveRequestOptions = ({
	deviceToken,
	channelType,
	options,
}: Pick<
	IdentifyUserInternalInput,
	'deviceToken' | 'channelType' | 'options'
>): IdentifyUserOptions & { channelType?: ChannelType } => {
	const isRegisteringDevice = !!deviceToken || !!options?.deviceId;
	if (!isRegisteringDevice) {
		return { ...options };
	}

	return {
		...options,
		address: deviceToken,
		channelType,
	};
};
