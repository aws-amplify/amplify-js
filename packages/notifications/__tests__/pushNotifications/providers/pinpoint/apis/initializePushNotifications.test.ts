// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { initializePushNotifications } from '../../../../../src/pushNotifications/providers/pinpoint/apis/initializePushNotifications';
import { expectNotSupported } from '../../../../testUtils/expectNotSupported';

describe('initializePushNotifications', () => {
	it('is only supported on React Native', async () => {
		expectNotSupported(initializePushNotifications);
	});
});
