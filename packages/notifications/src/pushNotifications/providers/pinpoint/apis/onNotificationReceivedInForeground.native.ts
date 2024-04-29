// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { addEventListener } from '../../../../eventListeners';
import { assertIsInitialized } from '../../../errors/errorHelpers';
import { OnNotificationReceivedInForeground } from '../types';

export const onNotificationReceivedInForeground: OnNotificationReceivedInForeground =
	input => {
		assertIsInitialized();

		return addEventListener('foregroundMessageReceived', input);
	};
