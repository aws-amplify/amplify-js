// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { addEventListener } from '~/src/eventListeners';
import { assertIsInitialized } from '~/src/pushNotifications/errors/errorHelpers';
import { OnNotificationReceivedInForeground } from '~/src/pushNotifications/providers/pinpoint/types';

export const onNotificationReceivedInForeground: OnNotificationReceivedInForeground =
	input => {
		assertIsInitialized();

		return addEventListener('foregroundMessageReceived', input);
	};
