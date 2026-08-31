// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NativeModules } from 'react-native';
import { PushNotificationNativeModule } from './types';
export { PushNotificationNativeModule } from './types';
/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export const {
	AmplifyRTNPushNotification,
}: { AmplifyRTNPushNotification?: PushNotificationNativeModule } =
	NativeModules;

// chore: trigger v5-stable LTS release to complete partial publish (uuid-v11 RN fix, datastore). No functional change.
