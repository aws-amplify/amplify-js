// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Types here are duplicated from `rtn-push-notifications` as it is not possible to share a source of truth
 * with a package that may conditionally not exist for developers not using push notifications. Modifications
 * made to these types should be reflected in the native module package and vice-versa!
 */
interface ApnsPlatformOptions {
	subtitle?: string;
}

interface FcmPlatformOptions {
	channelId: string;
	messageId: string;
	senderId: string;
	sendTime: Date;
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

export interface PushNotificationPermissions
	extends Partial<Record<string, boolean>> {
	alert?: boolean;
	badge?: boolean;
	sound?: boolean;
}
