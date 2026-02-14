// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { rememberDevice, signIn } from '../src';

describe('rememberDevice Integration Tests', () => {
	beforeEach(async () => {
		// Sign in - this will return NewDeviceMetadata in the response
		await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});
	});

	it('should successfully remember current device', async () => {
		await rememberDevice();

		// No error means success
		expect(true).toBe(true);
	});
});
