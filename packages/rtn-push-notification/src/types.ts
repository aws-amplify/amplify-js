// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface PushNotificationNativeModule {
	completeNotification?: (completionHandlerId: string) => void;
	getConstants: () => {
		NativeEvent: {
			BACKGROUND_MESSAGE_RECEIVED?: string;
			FOREGROUND_MESSAGE_RECEIVED: string;
			LAUNCH_NOTIFICATION_OPENED: string;
			NOTIFICATION_OPENED: string;
			TOKEN_RECEIVED: string;
		};
		NativeHeadlessTaskKey?: string;
	};
	getLaunchNotification: () => Promise<Record<string, string>>;
	getBadgeCount: () => Promise<number>;
	setBadgeCount: (count: number) => void;
	getPermissionStatus: () => Promise<string>;
	requestPermissions: (
		permissions: Record<string, boolean>
	) => Promise<boolean>;
}
