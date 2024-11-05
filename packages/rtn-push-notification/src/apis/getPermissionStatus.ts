// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { nativeModule } from '../nativeModule';
import { PushNotificationPermissionStatus } from '../types';
import { normalizeNativePermissionStatus } from '../utils';

export const getPermissionStatus =
	async (): Promise<PushNotificationPermissionStatus> =>
		normalizeNativePermissionStatus(await nativeModule.getPermissionStatus());
