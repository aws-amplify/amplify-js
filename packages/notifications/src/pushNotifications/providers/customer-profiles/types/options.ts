// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PinpointServiceOptions } from '@aws-amplify/core/internals/providers/pinpoint';

/**
 * Options for `identifyUser`. The Pinpoint service options shape (`address`, `optOut`, `userAttributes`) is reused so
 * the public `IdentifyUserInput` contract is identical across push notification providers, with added optional
 * device-registration fields. `platform` / `appVersion` describe the registering device; when omitted the backend
 * falls back to `userProfile.demographic.platform` / `.appVersion`.
 */
export type IdentifyUserOptions = PinpointServiceOptions & {
	deviceId?: string;
	platform?: string;
	appVersion?: string;
	/**
	 * On an authenticated `identifyUser` call, the Identity Pool `identityId`
	 * the caller used while they were a guest. When present the backend folds
	 * the prior guest profile (keyed on `cognitoIdentityId`) into the
	 * authenticated profile (keyed on `cognitoSub`), carrying over any devices
	 * registered pre-login (merge-on-sign-in).
	 */
	guestIdentityId?: string;
};
