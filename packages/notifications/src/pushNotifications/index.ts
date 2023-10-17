// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export {
	identifyUser,
	IdentifyUserInput,
	initializePushNotifications,
} from './providers/pinpoint';
export {
	PushNotificationEvent,
	PushNotificationMessage,
	PushNotificationPermissionStatus,
} from './types';
export { PushNotificationError } from './errors';
