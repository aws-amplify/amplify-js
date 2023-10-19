// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InAppMessagingAction } from '@aws-amplify/core/internals/utils';
import {
	updateEndpoint,
	UpdateEndpointException,
} from '@aws-amplify/core/internals/providers/pinpoint';
import { InAppMessagingValidationErrorCode } from '../../../errors';
import {
	CATEGORY,
	CHANNEL_TYPE,
	getInAppMessagingUserAgentString,
	resolveConfig,
	resolveCredentials,
} from '../utils';
import { IdentifyUserInput } from '../types';
import { assertIsInitialized } from '../../../utils';

/**
 * Sends information about a user to Pinpoint. Sending user information allows you to associate a user to their user
 * profile and activities or actions in your application. Activity can be tracked across devices & platforms by using
 * the same `userId`.
 *
 * @param {IdentifyUserParameters} params The input object used to construct requests sent to Pinpoint's UpdateEndpoint
 *  API.
 * @throws service: {@link UpdateEndpointException} - Thrown when the underlying Pinpoint service returns an error.
 * @throws validation: {@link InAppMessagingValidationErrorCode} - Thrown when the provided parameters or library
 * configuration is incorrect, or if In App messaging hasn't been initialized.
 * @returns A promise that will resolve when the operation is complete.
 * @example
 * ```ts
 * // Identify a user with Pinpoint
 * await identifyUser({
 *     userId,
 *     userProfile: {
 *         email: 'userEmail@example.com'
 *         customProperties: {
 *             phoneNumber: ['555-555-5555'],
 *         },
 *     }
 * });
 * ```
 *
 * @example
 * ```ts
 * // Identify a user with Pinpoint specific options
 * await identifyUser({
 *     userId,
 *     userProfile: {
 *         email: 'userEmail@example.com'
 *         customProperties: {
 *             phoneNumber: ['555-555-5555'],
 *         },
 *         demographic: {
 *             platform: 'ios',
 *             timezone: 'America/Los_Angeles'
 *         }
 *     },
 *     options: {
 *         address: 'device-address',
 *         optOut: 'NONE',
 *         userAttributes: {
 *             interests: ['food']
 *         },
 *     },
 * });
 */
export const identifyUser = async ({
	userId,
	userProfile,
	options,
}: IdentifyUserInput): Promise<void> => {
	assertIsInitialized();
	const { credentials, identityId } = await resolveCredentials();
	const { appId, region } = resolveConfig();
	const { address, optOut, userAttributes } = options ?? {};
	updateEndpoint({
		address,
		channelType: CHANNEL_TYPE,
		optOut,
		appId,
		category: CATEGORY,
		credentials,
		identityId,
		region,
		userAttributes,
		userId,
		userProfile,
		userAgentValue: getInAppMessagingUserAgentString(
			InAppMessagingAction.IdentifyUser
		),
	});
};
