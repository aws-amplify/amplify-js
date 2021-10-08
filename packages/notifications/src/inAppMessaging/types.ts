/*
 * Copyright 2017-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import { NotificationsCategory } from '../types';

export type NotificationsSubcategory = 'InAppMessaging';

export type InAppMessagingEvent = {
	name: string;
	attributes?: Record<string, string>;
	metrics?: Record<string, number>;
};

export interface InAppMessagingConfig {
	listenForAnalyticsEvents?: boolean;
}

export interface InAppMessagingProvider {
	// you need to implement these methods

	// configure your provider
	configure(config: object): object;

	// return category ('Notifications')
	getCategory(): NotificationsCategory;

	// return sub-category ('InAppMessaging')
	getSubCategory(): NotificationsSubcategory;

	// return the name of you provider
	getProviderName(): string;

	// get in-app messages from provider
	getInAppMessages(): Promise<any>;

	// filters in-app messages based on event input and provider logic
	processInAppMessages(
		messages: InAppMessage[],
		event: InAppMessagingEvent
	): Promise<InAppMessage[]>;
}

export type InAppMessageLayout =
	| 'BOTTOM_BANNER'
	| 'CAROUSEL'
	| 'MIDDLE_BANNER'
	| 'OVERLAYS'
	| 'TOP_BANNER';

export type InAppMessageAction = 'CLOSE' | 'DEEP_LINK' | 'LINK';

interface InAppMessageHeader {
	content: string;
	style?: InAppMessageStyle;
}

interface InAppMessageBody {
	content: string;
	style?: InAppMessageStyle;
}

interface InAppMessageImage {
	src: string;
}

interface InAppMessageButton {
	title: string;
	action: InAppMessageAction;
	url?: string;
	style?: InAppMessageStyle;
}

export interface InAppMessageStyle {
	backgroundColor?: string;
	borderRadius?: number;
	color?: string;
	textAlign?: 'center' | 'left' | 'right';
}

export interface InAppMessageContent {
	header?: InAppMessageHeader;
	body?: InAppMessageBody;
	image?: InAppMessageImage;
	primaryButton?: InAppMessageButton;
	secondaryButton?: InAppMessageButton;
}

export interface InAppMessage {
	id: string;
	layout: InAppMessageLayout;
	content: InAppMessageContent[];
	metadata?: any;
}

export type OnMessagesReceivedHandler = (messages: InAppMessage[]) => any;

export type OnMessageEventHandler = (message: InAppMessage) => any;

interface Listener {
	remove: () => void;
}

export interface OnMessagesReceivedListener extends Listener {
	handleEvent: OnMessagesReceivedHandler;
}

export interface OnMessageEventListener extends Listener {
	handleEvent: OnMessageEventHandler;
}
