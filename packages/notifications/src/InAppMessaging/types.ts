/*
 * Copyright 2017-2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { AWSPinpointProviderConfig } from './Providers/AWSPinpointProvider/types';

export type NotificationsSubcategory = 'InAppMessaging';

export type UserInfo = {
	attributes?: Record<string, string[]>;
	demographic?: {
		appVersion?: string;
		locale?: string;
		make?: string;
		model?: string;
		modelVersion?: string;
		platform?: string;
		platformVersion?: string;
		timezone?: string;
	};
	location?: {
		city?: string;
		country?: string;
		latitude?: number;
		longitude?: number;
		postalCode?: string;
		region?: string;
	};
	metrics?: Record<string, number>;
};

export type InAppMessagingEvent = {
	name: string;
	attributes?: Record<string, string>;
	metrics?: Record<string, number>;
};

export interface InAppMessagingConfig {
	listenForAnalyticsEvents?: boolean;
	AWSPinpoint?: AWSPinpointProviderConfig;
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

	// identify the current user with the provider
	identifyUser(userId: string, userInfo: UserInfo): Promise<void>;
}

export type InAppMessageLayout =
	| 'BOTTOM_BANNER'
	| 'CAROUSEL'
	| 'FULL_SCREEN'
	| 'MIDDLE_BANNER'
	| 'MODAL'
	| 'TOP_BANNER';

export type InAppMessageAction = 'CLOSE' | 'DEEP_LINK' | 'LINK';

export type InAppMessageTextAlign = 'center' | 'left' | 'right';

interface InAppMessageContainer {
	style?: InAppMessageStyle;
}

interface InAppMessageHeader {
	content: string;
	style?: InAppMessageStyle;
}

interface InAppMessageBody {
	content: string;
	style?: InAppMessageStyle;
}

export interface InAppMessageImage {
	src: string;
}

export interface InAppMessageButton {
	title: string;
	action: InAppMessageAction;
	url?: string;
	style?: InAppMessageStyle;
}

export interface InAppMessageStyle {
	backgroundColor?: string;
	borderRadius?: number;
	color?: string;
	textAlign?: InAppMessageTextAlign;
}

export interface InAppMessageContent {
	container?: InAppMessageContainer;
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

export type OnMessageInteractionEventHandler = (message: InAppMessage) => any;

export interface OnMessageInteractionEventListener {
	handleEvent: OnMessageInteractionEventHandler;
	remove: () => void;
}

export enum InAppMessageInteractionEvent {
	MESSAGE_RECEIVED = 'MESSAGE_RECEIVED_EVENT',
	MESSAGE_DISPLAYED = 'MESSAGE_DISPLAYED_EVENT',
	MESSAGE_DISMISSED = 'MESSAGE_DISMISSED_EVENT',
	MESSAGE_ACTION_TAKEN = 'MESSAGE_ACTION_TAKEN_EVENT',
}

export type InAppMessageConflictHandler = (
	messages: InAppMessage[]
) => InAppMessage;
