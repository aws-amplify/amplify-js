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
	'PushNotification'
>;

export interface PushNotificationInterface {
	configure: (config: PushNotificationConfig) => PushNotificationConfig;
	getModuleName: () => NotificationsSubCategory;
	getPluggable: (providerName: string) => PushNotificationProvider;
	addPluggable: (pluggable: PushNotificationProvider) => void;
	removePluggable: (providerName: string) => void;
	identifyUser: (userId: string, userInfo: UserInfo) => Promise<void[]>;
	getLaunchNotification: () => Promise<PushNotificationMessage>;
	requestPermissions: (
		permissions?: PushNotificationPermissions
	) => Promise<PushNotificationPermissionStatus>;
	onBackgroundNotificationReceived: (
		handler: OnPushNotificationMessageHandler
	) => EventListener<OnPushNotificationMessageHandler>;
	onForegroundNotificationReceived: (
		handler: OnPushNotificationMessageHandler
	) => EventListener<OnPushNotificationMessageHandler>;
	onNotificationOpened: (
		handler: OnPushNotificationMessageHandler
	) => EventListener<OnPushNotificationMessageHandler>;
	onTokenReceived: (
		handler: OnTokenReceivedHandler
	) => EventListener<OnTokenReceivedHandler>;
}

export interface PushNotificationProvider extends NotificationsProvider {
	// return sub-category ('PushNotification')
	getSubCategory(): NotificationsSubCategory;

	// register device with provider
	registerDevice(token: string): Promise<void>;
}

export interface PushNotificationConfig {
	AWSPinpoint?: AWSPinpointProviderConfig;
}

export interface PushNotificationMessage {
	messageId?: string;
	senderId?: string;
	sendTime?: Date;
	collapseKey?: string;
	content?: PushNotificationMessageContent;
	data?: Record<string, any>;
}

interface PushNotificationMessageContent {
	title?: string;
	body?: string;
	imageUrl?: string;
	deeplinkUrl?: string;
	goToUrl?: string;
	platformOptions?: FcmPlatformOptions | ApnsPlatformOptions;
}

interface FcmPlatformOptions {
	channelId: string;
}

interface ApnsPlatformOptions {
	subtitle?: string;
}

export interface PushNotificationPermissions extends Record<string, boolean> {
	alert?: boolean;
	badge?: boolean;
	sound?: boolean;
}

export enum PushNotificationPermissionStatus {
	DENIED = 'DENIED',
	GRANTED = 'GRANTED',
	UNDETERMINED = 'UNDETERMINED',
}

export type OnTokenReceivedHandler = (token: PushNotificationTokenMap) => any;

export type OnPushNotificationMessageHandler = (
	message: PushNotificationMessage
) => any;

export enum PushNotificationEvent {
	BACKGROUND_MESSAGE_RECEIVED = 'BACKGROUND_MESSAGE_RECEIVED',
	FOREGROUND_MESSAGE_RECEIVED = 'FOREGROUND_MESSAGE_RECEIVED',
	LAUNCH_NOTIFICATION_OPENED = 'LAUNCH_NOTIFICATION_OPENED',
	NOTIFICATION_OPENED = 'NOTIFICATION_OPENED',
	TOKEN_RECEIVED = 'TOKEN_RECEIVED',
}

export interface PushNotificationTokenMap {
	token: string;
}
