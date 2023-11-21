// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAmplifyPushNotification } from '@aws-amplify/react-native';
import { assertIsInitialized } from '~/src/pushNotifications/errors/errorHelpers';
import { RequestPermissions } from '~/src/pushNotifications/providers/pinpoint/types';

const { requestPermissions: requestPermissionsNative } =
	loadAmplifyPushNotification();

export const requestPermissions: RequestPermissions = async input => {
	assertIsInitialized();

	return requestPermissionsNative(input);
};
