// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { addEventListener } from '../../../../eventListeners';
import { assertIsInitialized } from '../../../errors/errorHelpers';
import { OnNotificationOpened } from '../types';

export const onNotificationOpened: OnNotificationOpened = input => {
	assertIsInitialized();

	return addEventListener('notificationOpened', input);
};
