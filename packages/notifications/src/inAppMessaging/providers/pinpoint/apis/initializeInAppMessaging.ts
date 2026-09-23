// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyContext,
	Hub,
	HubCapsule,
	getGlobalContext,
	isAmplifyContext,
} from '@aws-amplify/core';
import {
	resolveCtxArgs,
	sessionListener,
} from '@aws-amplify/core/internals/utils';

import { InAppMessage, InAppMessagingEvent } from '../../../types';
import { addEventListener } from '../../../../eventListeners';
import { recordAnalyticsEvent } from '../utils/helpers';
import { PinpointMessageEvent } from '../types';
import { incrementMessageCounts, sessionStateChangeHandler } from '../utils';
import { initialize, isInitialized } from '../../../utils';

import { dispatchEvent } from './dispatchEvent';
/**
 * @param ctx - The {@link AmplifyContext} to use for config and credentials.
 */
export function initializeInAppMessaging(ctx: AmplifyContext): void;

/**
 * Initialize and set up in-app messaging category. This API needs to be called to enable other InAppMessaging APIs.
 *
 * @deprecated AWS will end support for Amazon Pinpoint on October 30, 2026.
 *
 * @remarks
 * Make sure to call this early in your app at the root entry point after configuring Amplify.
 * Initialization runs once per session; subsequent calls are no-ops, so a context
 * passed on a later call will not replace the one captured at first initialization.
 * @example
 * ```ts
 * Amplify.configure(config);
 * initializeInAppMessaging();
 * ```
 */
export function initializeInAppMessaging(): void;
export function initializeInAppMessaging(...args: any[]): void {
	// Validate that config is available (throws if not configured yet)
	resolveCtxArgs<[]>(args);

	// Reconfigure support: the global context is a frozen snapshot swapped on
	// each Amplify.configure() call. If the caller passed an explicit ctx we pin
	// it for the lifetime of the listeners; otherwise we resolve the CURRENT
	// global context at each event so listeners pick up reconfigured values.
	const explicitCtx = isAmplifyContext(args[0])
		? (args[0] as AmplifyContext)
		: undefined;
	const resolveCtx = (): AmplifyContext => explicitCtx ?? getGlobalContext();

	if (isInitialized()) {
		return;
	}
	// register with the session listener
	sessionListener.addStateChangeListener(sessionStateChangeHandler, true);

	// wire up default Pinpoint message event handling
	addEventListener('messageDisplayed', (message: InAppMessage) => {
		recordAnalyticsEvent(
			resolveCtx(),
			PinpointMessageEvent.MESSAGE_DISPLAYED,
			message,
		);
		incrementMessageCounts(message.id);
	});
	addEventListener('messageDismissed', (message: InAppMessage) => {
		recordAnalyticsEvent(
			resolveCtx(),
			PinpointMessageEvent.MESSAGE_DISMISSED,
			message,
		);
	});
	addEventListener('messageActionTaken', (message: InAppMessage) => {
		recordAnalyticsEvent(
			resolveCtx(),
			PinpointMessageEvent.MESSAGE_ACTION_TAKEN,
			message,
		);
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
