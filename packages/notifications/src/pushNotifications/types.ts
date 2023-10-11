// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PinpointProviderConfig } from '../common/providers/pinpoint/types';
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
	enable: () => void;
	identifyUser: (userId: string, userInfo: UserInfo) => Promise<void[]>;
	getLaunchNotification: () => Promise<PushNotificationMessage>;
	getBadgeCount: () => Promise<number>;
	setBadgeCount: (count: number) => void;
	getPermissionStatus: () => Promise<PushNotificationPermissionStatus>;
	requestPermissions: (
		permissions?: PushNotificationPermissions
	) => Promise<boolean>;
	onNotificationReceivedInBackground: (
		handler: OnPushNotificationMessageHandler
	) => void;
	onNotificationReceivedInForeground: (
		handler: OnPushNotificationMessageHandler
	) => void;
	onNotificationOpened: (handler: OnPushNotificationMessageHandler) => void;
	onTokenReceived: (handler: OnTokenReceivedHandler) => void;
}

export interface PushNotificationProvider extends NotificationsProvider {
	// return sub-category ('PushNotification')
	getSubCategory(): NotificationsSubCategory;

	// register device with provider
	registerDevice(token: string): Promise<void>;
}

export interface PushNotificationConfig {
	Pinpoint?: PinpointProviderConfig;
}

export interface PushNotificationMessage {
	title?: string;
	body?: string;
	imageUrl?: string;
	deeplinkUrl?: string;
	goToUrl?: string;
	fcmOptions?: FcmPlatformOptions;
	apnsOptions?: ApnsPlatformOptions;
	data?: Record<string, unknown>;
}

interface FcmPlatformOptions {
	channelId: string;
	messageId: string;
	senderId: string;
	sendTime: Date;
}

interface ApnsPlatformOptions {
	subtitle?: string;
}

export interface PushNotificationPermissions
	extends Partial<Record<string, boolean>> {
	alert?: boolean;
	badge?: boolean;
	sound?: boolean;
}

export enum PushNotificationPermissionStatus {
	DENIED = 'DENIED',
	GRANTED = 'GRANTED',
	SHOULD_REQUEST = 'SHOULD_REQUEST',
	SHOULD_EXPLAIN_THEN_REQUEST = 'SHOULD_EXPLAIN_THEN_REQUEST',
}

export type OnTokenReceivedHandler = (token: string) => any;

export type OnPushNotificationMessageHandler = (
	message: PushNotificationMessage
) => any;

export type PushNotificationEvent =
	| 'backgroundMessageReceived'
	| 'foregroundMessageReceived'
	| 'launchNotificationsOpened'
	| 'notificationOpened'
	| 'tokenReceived';

export interface NormalizedValues {
	body?: string;
	imageUrl?: string;
	title?: string;
	action?: Pick<PushNotificationMessage, 'goToUrl' | 'deeplinkUrl'>;
	options?: Pick<PushNotificationMessage, 'apnsOptions' | 'fcmOptions'>;
	data?: Record<string, unknown>;
}
