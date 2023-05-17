// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NativeModules } from 'react-native';
import { PushNotificationNativeModule } from './types';
export { PushNotificationNativeModule } from './types';
export const {
	AmplifyRTNPushNotification,
}: { AmplifyRTNPushNotification?: PushNotificationNativeModule } =
	NativeModules;
