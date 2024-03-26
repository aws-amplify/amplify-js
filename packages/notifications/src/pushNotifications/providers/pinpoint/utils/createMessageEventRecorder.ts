// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { record } from '@aws-amplify/core/internals/providers/pinpoint';
import { ConsoleLogger } from '@aws-amplify/core';
import { AWSCredentials } from '@aws-amplify/core/internals/utils';

import { PinpointMessageEvent } from '../types';
import {
	OnPushNotificationMessageHandler,
	PushNotificationMessage,
} from '../../../types';
import { resolveCredentials } from '../../../utils';

import { getAnalyticsEvent } from './getAnalyticsEvent';
import { getChannelType } from './getChannelType';
import { resolveConfig } from './resolveConfig';

const logger = new ConsoleLogger('PushNotification.recordMessageEvent');

/**
 * @internal
 */
export const createMessageEventRecorder =
	(
		event: PinpointMessageEvent,
		callback?: () => void,
	): OnPushNotificationMessageHandler =>
	async message => {
		const { credentials } = await resolveCredentials();
		const { appId, region } = resolveConfig();
		await recordMessageEvent({
			appId,
			credentials,
			event,
			message,
			region,
		});
		callback?.();
	};

const recordMessageEvent = async ({
	appId,
	credentials,
	event,
	message,
	region,
}: {
	appId: string;
	credentials: AWSCredentials;
	event: PinpointMessageEvent;
	message: PushNotificationMessage;
	region: string;
}): Promise<void> => {
	const analyticsEvent = getAnalyticsEvent(message, event);
	if (!analyticsEvent) {
		logger.debug('A notification missing event information was not recorded');

		return;
	}

	return record({
		appId,
		category: 'PushNotification',
		channelType: getChannelType(),
		credentials,
		event: analyticsEvent,
		region,
	});
};
