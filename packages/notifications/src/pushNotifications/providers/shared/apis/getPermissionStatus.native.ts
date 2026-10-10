// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAmplifyPushNotification } from '@aws-amplify/react-native';

import { assertIsInitialized } from '../../../errors/errorHelpers';
import { GetPermissionStatus } from '../types';

const { getPermissionStatus: getPermissionStatusNative } =
	loadAmplifyPushNotification();

export const getPermissionStatus: GetPermissionStatus = async () => {
	assertIsInitialized();

	return getPermissionStatusNative();
};
