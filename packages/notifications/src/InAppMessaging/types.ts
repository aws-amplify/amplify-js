// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EventListener } from '../common';
import { AWSPinpointProviderConfig } from '../common/AWSPinpointProviderCommon/types';
import {
	NotificationsProvider,
	NotificationsSubCategory as NotificationsSubCategories,
	UserInfo,
} from '../types';

export type NotificationsSubCategory = Extract<
	NotificationsSubCategories,
	'InAppMessaging'
>;

export interface InAppMessagingInterface {
	configure: (config: InAppMessagingConfig) => InAppMessagingConfig;
	getModuleName: () => NotificationsSubCategory;
	getPluggable: (providerName: string) => InAppMessagingProvider;
	addPluggable: (pluggable: InAppMessagingProvider) => void;
	removePluggable: (providerName: string) => void;
	syncMessages: () => Promise<void[]>;
	clearMessages: () => Promise<void[]>;
	dispatchEvent: (event: InAppMessagingEvent) => Promise<void>;
	identifyUser: (userId: string, userInfo: UserInfo) => Promise<void[]>;
	onMessageReceived: (
		handler: OnMessageInteractionEventHandler
	) => EventListener<OnMessageInteractionEventHandler>;
	onMessageDisplayed: (
		handler: OnMessageInteractionEventHandler
	) => EventListener<OnMessageInteractionEventHandler>;
	onMessageDismissed: (
		handler: OnMessageInteractionEventHandler
	) => EventListener<OnMessageInteractionEventHandler>;
	onMessageActionTaken: (
		handler: OnMessageInteractionEventHandler
	) => EventListener<OnMessageInteractionEventHandler>;
	notifyMessageInteraction: (
		message: InAppMessage,
		type: InAppMessageInteractionEvent
	) => void;
	setConflictHandler: (handler: InAppMessageConflictHandler) => void;
}

export interface InAppMessagingProvider extends NotificationsProvider {
	// return sub-category ('InAppMessaging')
	getSubCategory(): NotificationsSubCategory;

	// get in-app messages from provider
	getInAppMessages(): Promise<any>;

	// filters in-app messages based on event input and provider logic
	processInAppMessages(
		messages: InAppMessage[],
		event: InAppMessagingEvent
	): Promise<InAppMessage[]>;
}

export interface InAppMessagingConfig {
	listenForAnalyticsEvents?: boolean;
	AWSPinpoint?: AWSPinpointProviderConfig;
}

export type InAppMessagingEvent = {
	name: string;
	attributes?: Record<string, string>;
	metrics?: Record<string, number>;
};

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

export enum InAppMessageInteractionEvent {
	MESSAGE_RECEIVED = 'MESSAGE_RECEIVED_EVENT',
	MESSAGE_DISPLAYED = 'MESSAGE_DISPLAYED_EVENT',
	MESSAGE_DISMISSED = 'MESSAGE_DISMISSED_EVENT',
	MESSAGE_ACTION_TAKEN = 'MESSAGE_ACTION_TAKEN_EVENT',
}

export type InAppMessageConflictHandler = (
	messages: InAppMessage[]
) => InAppMessage;
