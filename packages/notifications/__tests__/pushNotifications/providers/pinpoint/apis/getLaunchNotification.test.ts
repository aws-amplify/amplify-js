// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getLaunchNotification } from '../../../../../src/pushNotifications/providers/pinpoint/apis/getLaunchNotification';
import { expectNotSupportedAsync } from '../../../../testUtils/expectNotSupported';

describe('getLaunchNotification', () => {
	it('is only supported on React Native', async () => {
		await expectNotSupportedAsync(getLaunchNotification());
	});
});
