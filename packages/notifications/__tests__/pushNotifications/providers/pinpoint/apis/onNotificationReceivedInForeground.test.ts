// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { onNotificationReceivedInForeground } from '../../../../../src/pushNotifications/providers/pinpoint/apis/onNotificationReceivedInForeground';
import { expectNotSupported } from '../../../../testUtils/expectNotSupported';

describe('onNotificationReceivedInForeground', () => {
	it('is only supported on React Native', () => {
		expectNotSupported(() => onNotificationReceivedInForeground(jest.fn()));
	});
});
