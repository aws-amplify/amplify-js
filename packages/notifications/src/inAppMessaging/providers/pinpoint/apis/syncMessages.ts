// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	InAppMessagingAction,
	ConsoleLogger as Logger,
} from '@aws-amplify/core/internals/utils';
import {
	updateEndpoint,
	getEndpointId,
} from '@aws-amplify/core/internals/providers/pinpoint';
import { defaultStorage } from '@aws-amplify/core';
import {
	resolveConfig,
	resolveCredentials,
	getInAppMessagingUserAgentString,
	INAPP_STORAGE_KEY_SUFFIX,
	PINPOINT_KEY_PREFIX,
	UPDATEENDPOINT_CATEGORY,
	CHANNEL_TYPE,
} from '../utils';
import {
	getInAppMessages,
	GetInAppMessagesInput,
	GetInAppMessagesOutput,
} from '@aws-amplify/core/internals/aws-clients/pinpoint';
import {
	InAppMessagingValidationErrorCode,
	assertValidationError,
} from '../../../errors';

const logger = new Logger('Notifications.InAppMessaging.syncMessages');

/**
 * Get the map resources that are currently available through the provider
 * @param {string} provider
 * @returns - Array of available map resources
 */
export async function syncMessages(): Promise<void> {
	try {
		const messages = await fetchInAppMessages();
		if (messages.length === 0) {
			return;
		}
		const key = `${PINPOINT_KEY_PREFIX}${INAPP_STORAGE_KEY_SUFFIX}`;
		await defaultStorage.setItem(key, JSON.stringify(messages));
	} catch (err) {
		logger.error('Failed to sync messages', err);
		throw err;
	}
}

async function fetchInAppMessages() {
	try {
		const { credentials, identityId } = await resolveCredentials();
		const { appId, region } = resolveConfig();
		let endpointId = await getEndpointId(appId, UPDATEENDPOINT_CATEGORY);

		// Prepare a Pinpoint endpoint via updateEndpoint if one does not already exist, which will generate and cache an
		// endpoint ID between calls
		if (!endpointId) {
			await updateEndpoint({
				appId,
				category: UPDATEENDPOINT_CATEGORY,
				channelType: CHANNEL_TYPE,
				credentials,
				identityId,
				region,
				// TODO(V6): Update InAppMessagingAction.None
				userAgentValue: getInAppMessagingUserAgentString(
					InAppMessagingAction.None
				),
			});

			endpointId = await getEndpointId(appId, UPDATEENDPOINT_CATEGORY);
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
	} catch (err) {
		logger.error('Error getting in-app messages', err);
		throw err;
	}
}
