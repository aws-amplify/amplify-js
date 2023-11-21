// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InAppMessageInteractionEvent } from '~/src/inAppMessaging/types';
import { PushNotificationEvent } from '~/src/pushNotifications/types';

export interface EventListener<
	EventHandler extends (...args: any[]) => unknown,
> {
	handleEvent: EventHandler;
	remove(): void;
}

export type EventType = InAppMessageInteractionEvent | PushNotificationEvent;

export interface EventListenerRemover {
	remove(): void;
}
