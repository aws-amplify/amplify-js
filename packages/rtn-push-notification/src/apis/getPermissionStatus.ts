// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { nativeModule } from '~/src/nativeModule';
import { PushNotificationPermissionStatus } from '~/src/types';
import { normalizeNativePermissionStatus } from '~/src/utils';

export const getPermissionStatus =
	async (): Promise<PushNotificationPermissionStatus> =>
		normalizeNativePermissionStatus(await nativeModule.getPermissionStatus());
