// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAmplifyPushNotification } from '@aws-amplify/react-native';
import { assertIsInitialized } from '~/src/pushNotifications/errors/errorHelpers';
import { GetPermissionStatus } from '~/src/pushNotifications/providers/pinpoint/types';

const { getPermissionStatus: getPermissionStatusNative } =
	loadAmplifyPushNotification();

export const getPermissionStatus: GetPermissionStatus = async () => {
	assertIsInitialized();

	return getPermissionStatusNative();
};
