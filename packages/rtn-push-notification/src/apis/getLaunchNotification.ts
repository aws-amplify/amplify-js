// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { nativeModule } from '~/src/nativeModule';
import { PushNotificationMessage } from '~/src/types';
import { normalizeNativeMessage } from '~/src/utils';

export const getLaunchNotification =
	async (): Promise<PushNotificationMessage | null> =>
		normalizeNativeMessage(
			(await nativeModule.getLaunchNotification()) ?? undefined,
		);
