// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NativeModule } from 'react-native';

import { PushNotificationMessage, PushNotificationPermissions } from './module';

export interface PushNotificationNativeModule extends NativeModule {
	completeNotification?(completionHandlerId: string): void;
	getConstants(): {
		NativeEvent: {
			BACKGROUND_MESSAGE_RECEIVED?: string;
			FOREGROUND_MESSAGE_RECEIVED: string;
			LAUNCH_NOTIFICATION_OPENED: string;
			NOTIFICATION_OPENED: string;
			TOKEN_RECEIVED: string;
		};
		NativeHeadlessTaskKey?: string;
	};
	getLaunchNotification(): Promise<NativeMessage | null>;
	getBadgeCount?(): Promise<number>;
	setBadgeCount?(count: number): void;
	getPermissionStatus(): Promise<NativePermissionStatus>;
	requestPermissions(
		permissions: PushNotificationPermissions
	): Promise<boolean>;
}

export interface NativeAction {
	deeplink?: string;
	url?: string;
}

export type NativeMessage = (ApnsMessage | FcmMessage) & {
	token?: never;
};

export type NativePermissionStatus =
	| AndroidPermissionStatus
	| IosPermissionStatus;

export interface NormalizedValues {
	body?: string;
	imageUrl?: string;
	title?: string;
	action?: Pick<PushNotificationMessage, 'goToUrl' | 'deeplinkUrl'>;
	options?: Pick<PushNotificationMessage, 'apnsOptions' | 'fcmOptions'>;
	data?: Record<string, unknown>;
}

// iOS
export interface ApnsMessage {
	aps: {
		alert?: {
			body?: string;
			title?: string;
			subtitle?: string;
		};
	};
	data?: {
		pinpoint?: NativeAction;
		'media-url'?: string;
	};
	rawData?: never;
	completionHandlerId?: string;
}

export type IosPermissionStatus = 'NotDetermined' | 'Authorized' | 'Denied';

// Android
export interface FcmMessage {
	action?: NativeAction;
	aps?: never;
	body?: string;
	imageUrl?: string;
	rawData?: Record<string, unknown>;
	title?: string;
	channelId?: string;
	messageId?: string;
	senderId?: string;
	sendTime?: number;
	completionHandlerId?: never;
}

export type AndroidPermissionStatus =
	| 'ShouldRequest'
	| 'ShouldExplainThenRequest'
	| 'Granted'
	| 'Denied';

export interface TokenPayload {
	token: string;
}
