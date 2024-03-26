// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getPermissionStatus } from '../../src/apis/getPermissionStatus';
import { nativeModule } from '../../src/nativeModule';
import { normalizeNativePermissionStatus } from '../../src/utils';

jest.mock('../../src/nativeModule', () => ({
	nativeModule: {
		getPermissionStatus: jest.fn(),
	},
}));
jest.mock('../../src/utils');

describe('getPermissionStatus', () => {
	const status = 'Denied';
	// assert mocks
	const mockGetPermissionStatusNative =
		nativeModule.getPermissionStatus as jest.Mock;
	const mockNormalizeNativePermissionStatus =
		normalizeNativePermissionStatus as jest.Mock;

	beforeAll(() => {
		mockGetPermissionStatusNative.mockResolvedValue(status);
		mockNormalizeNativePermissionStatus.mockImplementation(
			status => `normalized-${status}`,
		);
	});

	afterEach(() => {
		mockGetPermissionStatusNative.mockClear();
		mockNormalizeNativePermissionStatus.mockClear();
	});

	it('calls the native getPermissionStatus', async () => {
		expect(await getPermissionStatus()).toBe(`normalized-${status}`);
		expect(mockGetPermissionStatusNative).toHaveBeenCalled();
		expect(mockNormalizeNativePermissionStatus).toHaveBeenCalledWith(status);
	});
});
