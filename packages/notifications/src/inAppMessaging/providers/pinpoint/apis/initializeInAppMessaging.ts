// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { sessionListener } from '@aws-amplify/core/internals/utils';
import { InAppMessage, InAppMessagingEvent } from '~/src/inAppMessaging/types';
import { addEventListener } from '~/src/eventListeners';
import { recordAnalyticsEvent } from '~/src/inAppMessaging/providers/pinpoint/utils/helpers';
import { PinpointMessageEvent } from '~/src/inAppMessaging/providers/pinpoint/types';
import { Hub, HubCapsule } from '@aws-amplify/core';
import {
	incrementMessageCounts,
	sessionStateChangeHandler,
} from '~/src/inAppMessaging/providers/pinpoint/utils';
import { initialize, isInitialized } from '~/src/inAppMessaging/utils';

import { dispatchEvent } from './dispatchEvent';

/**
 * Initialize and set up in-app messaging category. This API needs to be called to enable other InAppMessaging APIs.
 *
 * @remarks
 * Make sure to call this early in your app at the root entry point after configuring Amplify.
 * @example
 * ```ts
 * Amplify.configure(config);
 * initializeInAppMessaging();
 * ```
 */
export function initializeInAppMessaging(): void {
	if (isInitialized()) {
		return;
	}
	// register with the session listener
	sessionListener.addStateChangeListener(sessionStateChangeHandler, true);

	// wire up default Pinpoint message event handling
	addEventListener('messageDisplayed', (message: InAppMessage) => {
		recordAnalyticsEvent(PinpointMessageEvent.MESSAGE_DISPLAYED, message);
		incrementMessageCounts(message.id);
	});
	addEventListener('messageDismissed', (message: InAppMessage) => {
		recordAnalyticsEvent(PinpointMessageEvent.MESSAGE_DISMISSED, message);
	});
	addEventListener('messageActionTaken', (message: InAppMessage) => {
		recordAnalyticsEvent(PinpointMessageEvent.MESSAGE_ACTION_TAKEN, message);
	});

	// listen to analytics hub events
	Hub.listen('analytics', analyticsListener);

	initialize();
}

function analyticsListener({
	payload,
}: HubCapsule<string, { event: string; data: InAppMessagingEvent }>) {
	const { event, data } = payload;
	switch (event) {
		case 'record': {
			dispatchEvent(data);
			break;
		}
		default:
			break;
	}
}
