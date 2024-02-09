// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAmplifyPushNotification } from '@aws-amplify/react-native';
import { assertIsInitialized } from '../../../errors/errorHelpers';
import { GetLaunchNotification } from '../types';

const { getLaunchNotification: getLaunchNotificationNative } =
	loadAmplifyPushNotification();

export const getLaunchNotification: GetLaunchNotification = async () => {
	assertIsInitialized();
	return getLaunchNotificationNative();
};
