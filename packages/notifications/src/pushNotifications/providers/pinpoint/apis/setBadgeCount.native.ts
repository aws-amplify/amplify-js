// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAmplifyPushNotification } from '@aws-amplify/react-native';
import { assertIsInitialized } from '../../../errors/errorHelpers';
import { SetBadgeCount } from '../types';

const { setBadgeCount: setBadgeCountNative } = loadAmplifyPushNotification();

export const setBadgeCount: SetBadgeCount = input => {
	assertIsInitialized();
	setBadgeCountNative(input);
};
