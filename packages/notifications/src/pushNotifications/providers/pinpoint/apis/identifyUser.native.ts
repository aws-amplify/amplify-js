// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import {
	PushNotificationAction,
	resolveCtxArgs,
} from '@aws-amplify/core/internals/utils';
import {
	getEndpointId,
	updateEndpoint,
} from '@aws-amplify/core/internals/providers/pinpoint';

import { assertIsInitialized } from '../../../errors/errorHelpers';
import {
	getPushNotificationUserAgentString,
	resolveCredentials,
} from '../../../utils';
import {
	getChannelType,
	getInflightDeviceRegistration,
	resolveConfig,
} from '../utils';
import { IdentifyUserInput } from '../types';
/**
 * @param ctx - The {@link AmplifyContext} to use for config and credentials.
 */
export async function identifyUser(
	ctx: AmplifyContext,
	input: IdentifyUserInput,
): Promise<void>;

/**
 * Sends information about a user to Pinpoint. Sending user information allows you to associate a user to their user
 * profile and activities or actions in your application. Activity can be tracked across devices & platforms by using
 * the same `userId`.
 *
 * @deprecated AWS will end support for Amazon Pinpoint on October 30, 2026.
 *
 * @param input The input object used to construct requests sent to Pinpoint's UpdateEndpoint API.
 * @returns A promise that will resolve when the operation is complete.
 */
export async function identifyUser(input: IdentifyUserInput): Promise<void>;
export async function identifyUser(...args: any[]): Promise<void> {
	const [ctx, input] = resolveCtxArgs<[IdentifyUserInput]>(args);
	const { userId, userProfile, options } = input;
	assertIsInitialized();
	const { credentials, identityId } = await resolveCredentials(ctx);
	const { appId, region } = resolveConfig(ctx);
	const { address, optOut, userAttributes } = options ?? {};
	if (!(await getEndpointId(appId, 'PushNotification'))) {
		// if there is no cached endpoint id, wait for successful endpoint creation before continuing
		await getInflightDeviceRegistration();
	}
	await updateEndpoint({
		address,
		channelType: getChannelType(),
		optOut,
		appId,
		category: 'PushNotification',
		credentials,
		identityId,
		region,
		userAttributes,
		userId,
		userProfile,
		userAgentValue: getPushNotificationUserAgentString(
			PushNotificationAction.IdentifyUser,
		),
	});
}
