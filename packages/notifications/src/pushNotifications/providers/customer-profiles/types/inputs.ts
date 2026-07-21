// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UserProfile } from './pushNotifications';

export {
	OnNotificationOpenedInput,
	OnNotificationReceivedInBackgroundInput,
	OnNotificationReceivedInForegroundInput,
	OnTokenReceivedInput,
	RequestPermissionsInput,
	SetBadgeCountInput,
} from '../../shared/types';

/**
 * Input for `identifyUser`. Profile-only: the Customer Profiles backend derives
 * the caller's `principalId` server-side from the SigV4 signer identity, so no
 * `userId` is sent by the client.
 */
export interface IdentifyUserInput {
	userProfile: UserProfile;
}

/**
 * Input for `registerDevice`. The SDK internally supplies the remaining device
 * fields (`deviceId`, `platform`, `appVersion`, `channelType`).
 */
export interface RegisterDeviceInput {
	token: string;
}
