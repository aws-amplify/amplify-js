// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchDevices, signIn } from '../src';

describe('fetchDevices Integration Tests', () => {
	beforeEach(async () => {
		// Sign in - this will return NewDeviceMetadata in the response
		await signIn({
			username: 'testuser',
			password: 'TestPassword123!',
		});
	});

	it('should successfully fetch user devices', async () => {
		const result = await fetchDevices();

		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBe(1);
		expect(result[0].id).toBe('device-12345');
		expect(result[0].name).toBe('Test Device');
	});
});
