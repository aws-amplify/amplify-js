// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';

import { identifyUser } from '../../../../../src/pushNotifications/providers/pinpoint/apis/identifyUser';
import { expectNotSupportedAsync } from '../../../../testUtils/expectNotSupported';
import { createMockAmplifyContext } from '../../../../testUtils/createMockAmplifyContext';

describe('identifyUser', () => {
	beforeAll(() => {
		setGlobalContext(createMockAmplifyContext());
	});

	afterAll(() => {
		clearGlobalContext();
	});

	it('is only supported on React Native', async () => {
		await expectNotSupportedAsync(
			identifyUser({ userId: 'user-id', userProfile: {} }),
		);
	});
});
