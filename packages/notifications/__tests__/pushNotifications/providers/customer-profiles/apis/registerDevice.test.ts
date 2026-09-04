// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';
import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';

import { registerDevice } from '../../../../../src/pushNotifications/providers/customer-profiles/apis/registerDevice';

describe('registerDevice (customer-profiles, web stub)', () => {
	beforeAll(() => {
		setGlobalContext(createMockAmplifyContext());
	});

	afterAll(() => {
		clearGlobalContext();
	});

	it('throws PlatformNotSupportedError', async () => {
		await expect(registerDevice({ token: 'token' })).rejects.toThrow(
			'Function not supported on current platform',
		);
	});
});
