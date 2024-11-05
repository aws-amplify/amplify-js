// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { onNotificationOpened } from '../../../../../src/pushNotifications/providers/pinpoint/apis/onNotificationOpened';
import { expectNotSupported } from '../../../../testUtils/expectNotSupported';

describe('onNotificationOpened', () => {
	it('is only supported on React Native', () => {
		expectNotSupported(() => onNotificationOpened(jest.fn()));
	});
});
