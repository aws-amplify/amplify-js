// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InAppMessagingAction } from '@aws-amplify/core/internals/utils';
import {
	updateEndpoint,
	getEndpointId,
} from '@aws-amplify/core/internals/providers/pinpoint';
import { defaultStorage } from '@aws-amplify/core';
import {
	resolveConfig,
	resolveCredentials,
	getInAppMessagingUserAgentString,
	STORAGE_KEY_SUFFIX,
	PINPOINT_KEY_PREFIX,
	CATEGORY,
	CHANNEL_TYPE,
} from '../utils';
import {
	getInAppMessages,
	GetInAppMessagesInput,
	GetInAppMessagesOutput,
} from '@aws-amplify/core/internals/aws-clients/pinpoint';
import {
	InAppMessagingValidationErrorCode,
	assertServiceError,
	assertValidationError,
} from '../../../errors';

/**
 * Fetch and persist messages from Pinpoint campaigns.
 * Calling this API is necessary to trigger InApp messages on the device.
 *
 * @throws service exceptions - Thrown when the underlying Pinpoint service returns an error.
 * @throws validation: {@link InAppMessagingValidationErrorCode} - Thrown when the provided parameters or library
 *  configuration is incorrect.
 *
 * @returns A promise that will resolve when the operation is complete.
 *
 * @example
 * ```ts
 * // Sync InApp messages with Pinpoint and device.
 * await syncMessages();
 *
 * ```
 */
export async function syncMessages(): Promise<void> {
	const messages = await fetchInAppMessages();
	if (messages.length === 0) {
		return;
	}
	try {
		const key = `${PINPOINT_KEY_PREFIX}${STORAGE_KEY_SUFFIX}`;
		await defaultStorage.setItem(key, JSON.stringify(messages));
	} catch (error) {
		assertServiceError(error);
		throw error;
	}
}

async function fetchInAppMessages() {
	try {
		const { credentials, identityId } = await resolveCredentials();
		const { appId, region } = resolveConfig();
		let endpointId = await getEndpointId(appId, CATEGORY);

		// Prepare a Pinpoint endpoint via updateEndpoint if one does not already exist, which will generate and cache an
		// endpoint ID between calls
		if (!endpointId) {
			await updateEndpoint({
				appId,
				category: CATEGORY,
				channelType: CHANNEL_TYPE,
				credentials,
				identityId,
				region,
				userAgentValue: getInAppMessagingUserAgentString(
					InAppMessagingAction.SyncMessages
				),
			});

			endpointId = await getEndpointId(appId, CATEGORY);
		}

		assertValidationError(
			!!endpointId,
			InAppMessagingValidationErrorCode.NoEndpointId
		);

		const input: GetInAppMessagesInput = {
			ApplicationId: appId,
			EndpointId: endpointId,
		};
		const response: GetInAppMessagesOutput = await getInAppMessages(
			{ credentials, region },
			input
		);
		const { InAppMessageCampaigns: messages } = response.InAppMessagesResponse;
		return messages;
	} catch (error) {
		assertServiceError(error);
		throw error;
	}
}
