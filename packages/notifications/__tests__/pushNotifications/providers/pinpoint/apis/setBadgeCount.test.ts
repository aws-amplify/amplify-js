// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { setBadgeCount } from '../../../../../src/pushNotifications/providers/pinpoint/apis/setBadgeCount';
import { expectNotSupported } from '../../../../testUtils/expectNotSupported';

describe('getBadgeCount', () => {
	it('is only supported on React Native', () => {
		expectNotSupported(() => setBadgeCount(42));
	});
});
