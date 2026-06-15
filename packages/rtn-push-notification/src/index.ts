// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NativeModules } from 'react-native';
import { PushNotificationNativeModule } from './types';
export { PushNotificationNativeModule } from './types';
export const {
	AmplifyRTNPushNotification,
}: { AmplifyRTNPushNotification?: PushNotificationNativeModule } =
	NativeModules;

// chore: trigger v5-stable LTS release to complete partial publish (uuid-v11 RN fix, datastore). No functional change.
