// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { requestPermissions } from '../../src/apis/requestPermissions';
import { nativeModule } from '../../src/nativeModule';

jest.mock('../../src/nativeModule', () => ({
	nativeModule: {
		requestPermissions: jest.fn(),
	},
}));

describe('requestPermissions', () => {
	// assert mocks
	const mockRequestPermissionsNative =
		nativeModule.requestPermissions as jest.Mock;

	beforeAll(() => {
		mockRequestPermissionsNative.mockResolvedValue(true);
	});

	afterEach(() => {
		mockRequestPermissionsNative.mockClear();
	});

	it('calls the native requestPermissions with defaults', async () => {
		expect(await requestPermissions()).toBe(true);
		expect(mockRequestPermissionsNative).toHaveBeenCalledWith({
			alert: true,
			badge: true,
			sound: true,
		});
	});

	it('calls the native requestPermissions with specified permissions disabled', async () => {
		expect(
			await requestPermissions({
				badge: false,
				sound: false,
			})
		).toBe(true);
		expect(mockRequestPermissionsNative).toHaveBeenCalledWith({
			alert: true,
			badge: false,
			sound: false,
		});
	});
});
