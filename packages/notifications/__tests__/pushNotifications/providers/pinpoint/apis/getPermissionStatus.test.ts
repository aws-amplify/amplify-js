// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getPermissionStatus } from '../../../../../src/pushNotifications/providers/pinpoint/apis/getPermissionStatus';
import { expectNotSupportedAsync } from '../../../../testUtils/expectNotSupported';

describe('getPermissionStatus', () => {
	it('is only supported on React Native', async () => {
		await expectNotSupportedAsync(getPermissionStatus());
	});
});
