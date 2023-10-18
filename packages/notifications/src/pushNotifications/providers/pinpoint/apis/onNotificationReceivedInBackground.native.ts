// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { addEventListener } from '../../../../eventListeners';
import { assertIsInitialized } from '../../../errors/errorHelpers';
import { OnNotificationReceivedInBackground } from '../types';

export const onNotificationReceivedInBackground: OnNotificationReceivedInBackground =
	input => {
		assertIsInitialized();
		return addEventListener('backgroundMessageReceived', input);
	};
