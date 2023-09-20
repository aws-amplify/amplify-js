// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { identifyUser as pushNotificationIdentifyUser } from './PushNotification/providers/pinpoint';
export { identifyUser as inAppMessagingIdentifyUser } from './InAppMessaging/providers/pinpoint';

export { AWSPinpointProviderCommon } from './common';
export { AWSPinpointUserInfo } from './common/AWSPinpointProviderCommon/types';
export {
	InAppMessage,
	InAppMessageAction,
	InAppMessageButton,
	InAppMessageContent,
	InAppMessageImage,
	InAppMessageInteractionEvent,
	InAppMessageLayout,
	InAppMessageStyle,
	InAppMessageTextAlign,
	InAppMessagingConfig,
	InAppMessagingEvent,
} from './InAppMessaging';
export {
	PushNotificationMessage,
	PushNotificationPermissions,
	PushNotificationPermissionStatus,
} from './PushNotification/types';
export { NotificationsConfig, UserInfo } from './types';
