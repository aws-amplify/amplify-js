// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { identifyUser } from '../../../../../src/pushNotifications/providers/pinpoint/apis/identifyUser';
import { expectNotSupportedAsync } from '../../../../testUtils/expectNotSupported';
import { createMockAmplifyContext } from '../../../../testUtils/mockAmplifyContext';

const mockCtx = createMockAmplifyContext();

describe('identifyUser', () => {
	it('is only supported on React Native', async () => {
		await expectNotSupportedAsync(
			identifyUser(mockCtx, { userId: 'user-id', userProfile: {} }),
		);
	});
});
