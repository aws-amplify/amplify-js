// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { addEventListener } from '~/src/eventListeners';
import { assertIsInitialized } from '~/src/pushNotifications/errors/errorHelpers';
import { OnNotificationOpened } from '~/src/pushNotifications/providers/pinpoint/types';

export const onNotificationOpened: OnNotificationOpened = input => {
	assertIsInitialized();

	return addEventListener('notificationOpened', input);
};
