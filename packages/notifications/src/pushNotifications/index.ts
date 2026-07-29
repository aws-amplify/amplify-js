// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// This entry point intentionally re-exports the deprecated Pinpoint provider
// APIs as the default Push Notifications surface. Removing them would be a
// breaking change; instead each is wrapped to emit a one-time runtime
// deprecation warning. The deprecated imports below are therefore expected.
/* eslint-disable import/no-deprecated */
import {
	getBadgeCount as getBadgeCountPinpoint,
	getLaunchNotification as getLaunchNotificationPinpoint,
	getPermissionStatus as getPermissionStatusPinpoint,
	identifyUser as identifyUserPinpoint,
	initializePushNotifications as initializePushNotificationsPinpoint,
	onNotificationOpened as onNotificationOpenedPinpoint,
	onNotificationReceivedInBackground as onNotificationReceivedInBackgroundPinpoint,
	onNotificationReceivedInForeground as onNotificationReceivedInForegroundPinpoint,
	onTokenReceived as onTokenReceivedPinpoint,
	requestPermissions as requestPermissionsPinpoint,
	setBadgeCount as setBadgeCountPinpoint,
} from './providers/pinpoint';
import { deprecatePinpoint } from './utils';

/**
 * @deprecated The default `aws-amplify/push-notifications` entry point is deprecated because it is
 * backed by Amazon Pinpoint, for which AWS will end support on October 30, 2026. Import from a
 * supported provider sub-path export instead — for example
 * `aws-amplify/push-notifications/customer-profiles`.
 */
export const getBadgeCount = deprecatePinpoint(getBadgeCountPinpoint);

/**
 * @deprecated The default `aws-amplify/push-notifications` entry point is deprecated because it is
 * backed by Amazon Pinpoint, for which AWS will end support on October 30, 2026. Import from a
 * supported provider sub-path export instead — for example
 * `aws-amplify/push-notifications/customer-profiles`.
 */
export const setBadgeCount = deprecatePinpoint(setBadgeCountPinpoint);

/**
 * @deprecated The default `aws-amplify/push-notifications` entry point is deprecated because it is
 * backed by Amazon Pinpoint, for which AWS will end support on October 30, 2026. Import from a
 * supported provider sub-path export instead — for example
 * `aws-amplify/push-notifications/customer-profiles`.
 */
export const getPermissionStatus = deprecatePinpoint(
	getPermissionStatusPinpoint,
);

/**
 * @deprecated The default `aws-amplify/push-notifications` entry point is deprecated because it is
 * backed by Amazon Pinpoint, for which AWS will end support on October 30, 2026. Import from a
 * supported provider sub-path export instead — for example
 * `aws-amplify/push-notifications/customer-profiles`.
 */
export const requestPermissions = deprecatePinpoint(requestPermissionsPinpoint);

/**
 * @deprecated The default `aws-amplify/push-notifications` entry point is deprecated because it is
 * backed by Amazon Pinpoint, for which AWS will end support on October 30, 2026. Import from a
 * supported provider sub-path export instead — for example
 * `aws-amplify/push-notifications/customer-profiles`.
 */
export const getLaunchNotification = deprecatePinpoint(
	getLaunchNotificationPinpoint,
);

/**
 * @deprecated The default `aws-amplify/push-notifications` entry point is deprecated because it is
 * backed by Amazon Pinpoint, for which AWS will end support on October 30, 2026. Import from a
 * supported provider sub-path export instead — for example
 * `aws-amplify/push-notifications/customer-profiles`.
 */
export const onNotificationReceivedInForeground = deprecatePinpoint(
	onNotificationReceivedInForegroundPinpoint,
);

/**
 * @deprecated The default `aws-amplify/push-notifications` entry point is deprecated because it is
 * backed by Amazon Pinpoint, for which AWS will end support on October 30, 2026. Import from a
 * supported provider sub-path export instead — for example
 * `aws-amplify/push-notifications/customer-profiles`.
 */
export const onNotificationReceivedInBackground = deprecatePinpoint(
	onNotificationReceivedInBackgroundPinpoint,
);

/**
 * @deprecated The default `aws-amplify/push-notifications` entry point is deprecated because it is
 * backed by Amazon Pinpoint, for which AWS will end support on October 30, 2026. Import from a
 * supported provider sub-path export instead — for example
 * `aws-amplify/push-notifications/customer-profiles`.
 */
export const onNotificationOpened = deprecatePinpoint(
	onNotificationOpenedPinpoint,
);

/**
 * @deprecated The default `aws-amplify/push-notifications` entry point is deprecated because it is
 * backed by Amazon Pinpoint, for which AWS will end support on October 30, 2026. Import from a
 * supported provider sub-path export instead — for example
 * `aws-amplify/push-notifications/customer-profiles`.
 */
export const onTokenReceived = deprecatePinpoint(onTokenReceivedPinpoint);

/**
 * @deprecated The default `aws-amplify/push-notifications` entry point is deprecated because it is
 * backed by Amazon Pinpoint, for which AWS will end support on October 30, 2026. Import from a
 * supported provider sub-path export instead — for example
 * `aws-amplify/push-notifications/customer-profiles`.
 */
export const identifyUser = deprecatePinpoint(identifyUserPinpoint);

/**
 * @deprecated The default `aws-amplify/push-notifications` entry point is deprecated because it is
 * backed by Amazon Pinpoint, for which AWS will end support on October 30, 2026. Import from a
 * supported provider sub-path export instead — for example
 * `aws-amplify/push-notifications/customer-profiles`.
 */
export const initializePushNotifications = deprecatePinpoint(
	initializePushNotificationsPinpoint,
);

export {
	GetBadgeCountOutput,
	GetLaunchNotificationOutput,
	GetPermissionStatusOutput,
	IdentifyUserInput,
	OnNotificationOpenedInput,
	OnNotificationOpenedOutput,
	OnNotificationReceivedInBackgroundInput,
	OnNotificationReceivedInBackgroundOutput,
	OnNotificationReceivedInForegroundInput,
	OnNotificationReceivedInForegroundOutput,
	OnTokenReceivedInput,
	OnTokenReceivedOutput,
	RequestPermissionsInput,
	SetBadgeCountInput,
} from './providers/pinpoint';
export { PushNotificationMessage } from './types';
export { PushNotificationError } from './errors';
