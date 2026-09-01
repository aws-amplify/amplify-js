// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { initializePushNotifications } from '../../../../../src/pushNotifications/providers/customer-profiles/apis/initializePushNotifications';
import { expectNotSupportedAsync } from '../../../../testUtils/expectNotSupported';

describe('initializePushNotifications (customer-profiles, web stub)', () => {
	it('is only supported on React Native', async () => {
		await expectNotSupportedAsync(initializePushNotifications());
	});
});
