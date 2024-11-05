// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { onTokenReceived } from '../../../../../src/pushNotifications/providers/pinpoint/apis/onTokenReceived';
import { expectNotSupported } from '../../../../testUtils/expectNotSupported';

describe('onTokenReceived', () => {
	it('is only supported on React Native', () => {
		expectNotSupported(() => onTokenReceived(jest.fn()));
	});
});
