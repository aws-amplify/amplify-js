// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAmplifyPushNotification } from '@aws-amplify/react-native';
import { assertIsInitialized } from '../../../errors/errorHelpers';
import { GetBadgeCount } from '../types';

const { getBadgeCount: getBadgeCountNative } = loadAmplifyPushNotification();

export const getBadgeCount: GetBadgeCount = async () => {
	assertIsInitialized();
	return getBadgeCountNative();
};
