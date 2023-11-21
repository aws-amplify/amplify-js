// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { addEventListener } from '~/src/eventListeners';
import { assertIsInitialized } from '~/src/pushNotifications/errors/errorHelpers';
import { OnTokenReceived } from '~/src/pushNotifications/providers/pinpoint/types';

export const onTokenReceived: OnTokenReceived = input => {
	assertIsInitialized();

	return addEventListener('tokenReceived', input);
};
