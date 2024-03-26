// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InAppMessagingAction } from '@aws-amplify/core/internals/utils';
import { resolveEndpointId } from '@aws-amplify/core/internals/providers/pinpoint';
import { defaultStorage } from '@aws-amplify/core';
import {
	GetInAppMessagesInput,
	GetInAppMessagesOutput,
	getInAppMessages,
} from '@aws-amplify/core/internals/aws-clients/pinpoint';

import {
	CATEGORY,
	CHANNEL_TYPE,
	PINPOINT_KEY_PREFIX,
	STORAGE_KEY_SUFFIX,
	getInAppMessagingUserAgentString,
	resolveConfig,
	resolveCredentials,
} from '../utils';
import {
	InAppMessagingValidationErrorCode,
	assertServiceError,
} from '../../../errors';
import { assertIsInitialized } from '../../../utils';

/**
 * Fetch and persist messages from Pinpoint campaigns.
 * Calling this API is necessary to trigger InApp messages on the device.
 *
 * @throws service exceptions - Thrown when the underlying Pinpoint service returns an error.
 * @throws validation: {@link InAppMessagingValidationErrorCode} - Thrown when the provided parameters or library
 * configuration is incorrect, or if In App messaging hasn't been initialized.
 * @returns A promise that will resolve when the operation is complete.
 * @example
 * ```ts
 * // Sync InApp messages with Pinpoint and device.
 * await syncMessages();
 *
 * ```
 */
export async function syncMessages(): Promise<void> {
	assertIsInitialized();
	const messages = await fetchInAppMessages();
	if (!messages || messages.length === 0) {
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
		const endpointId = await resolveEndpointId({
			appId,
			category: CATEGORY,
			channelType: CHANNEL_TYPE,
			credentials,
			identityId,
			region,
			userAgentValue: getInAppMessagingUserAgentString(
				InAppMessagingAction.SyncMessages,
			),
		});

		const input: GetInAppMessagesInput = {
			ApplicationId: appId,
			EndpointId: endpointId,
		};
		const response: GetInAppMessagesOutput = await getInAppMessages(
			{ credentials, region },
			input,
		);
		const { InAppMessageCampaigns: messages } =
			response.InAppMessagesResponse ?? {};

		return messages;
	} catch (error) {
		assertServiceError(error);
		throw error;
	}
}
