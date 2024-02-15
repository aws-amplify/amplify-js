// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { nativeModule } from '../nativeModule';
import { PushNotificationMessage } from '../types';
import { normalizeNativeMessage } from '../utils';

export const getLaunchNotification =
	async (): Promise<PushNotificationMessage | null> =>
		normalizeNativeMessage(
			(await nativeModule.getLaunchNotification()) ?? undefined,
		);
