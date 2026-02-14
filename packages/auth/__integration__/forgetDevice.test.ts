// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { forgetDevice, signIn } from '../src';

describe('forgetDevice Integration Tests', () => {
	beforeEach(async () => {
		// Sign in - this will return NewDeviceMetadata in the response
		await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});
	});

	it('should successfully forget current device', async () => {
		await forgetDevice();

		// No error means success
		expect(true).toBe(true);
	});

	it('should successfully forget specific device by id', async () => {
		await forgetDevice({
			device: {
				id: 'device-12345',
			},
		});

		// No error means success
		expect(true).toBe(true);
	});
});
