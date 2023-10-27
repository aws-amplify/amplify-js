// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { onNotificationReceivedInBackground } from '../../../../../src/pushNotifications/providers/pinpoint/apis/onNotificationReceivedInBackground';
import { expectNotSupported } from '../../../../testUtils/expectNotSupported';

describe('onNotificationReceivedInBackground', () => {
	it('is only supported on React Native', () => {
		expectNotSupported(() => onNotificationReceivedInBackground(jest.fn()));
	});
});
