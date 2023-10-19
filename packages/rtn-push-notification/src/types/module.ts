// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface PushNotificationPermissions
	extends Partial<Record<string, boolean>> {
	alert?: boolean;
	badge?: boolean;
	sound?: boolean;
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

export type PushNotificationPermissionStatus =
	| 'denied'
	| 'granted'
	| 'shouldRequest'
	| 'shouldExplainThenRequest';

interface ApnsPlatformOptions {
	subtitle?: string;
}

interface FcmPlatformOptions {
	channelId: string;
	messageId: string;
	senderId: string;
	sendTime: Date;
}
