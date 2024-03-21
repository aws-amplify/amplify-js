// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PlatformNotSupportedError } from '@aws-amplify/core/internals/utils';
import { getOperatingSystem } from '@aws-amplify/react-native';

import { ChannelType } from '../types';

const operatingSystem = getOperatingSystem();
const isAndroid = operatingSystem === 'android';
const isIos = operatingSystem === 'ios';

/**
 * @internal
 */
export const getChannelType = (): ChannelType => {
	if (isAndroid) {
		// FCM was previously known as GCM and continues to be the channel type in Pinpoint
		return 'GCM';
	}
	if (isIos) {
		// If building in debug mode, use the APNs sandbox
		return __DEV__ ? 'APNS_SANDBOX' : 'APNS';
	}
	throw new PlatformNotSupportedError();
};
