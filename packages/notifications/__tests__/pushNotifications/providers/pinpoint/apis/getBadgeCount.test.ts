// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getBadgeCount } from '../../../../../src/pushNotifications/providers/pinpoint/apis/getBadgeCount';
import { expectNotSupportedAsync } from '../../../../testUtils/expectNotSupported';

describe('getBadgeCount', () => {
	it('is only supported on React Native', async () => {
		await expectNotSupportedAsync(getBadgeCount());
	});
});
