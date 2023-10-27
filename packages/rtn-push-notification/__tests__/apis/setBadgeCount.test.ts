// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { setBadgeCount } from '../../src/apis/setBadgeCount';
import { nativeModule } from '../../src/nativeModule';

jest.mock('../../src/nativeModule', () => ({
	nativeModule: {
		setBadgeCount: jest.fn(),
	},
}));

describe('setBadgeCount', () => {
	// assert mocks
	const mockSetBadgeCountNative = nativeModule.setBadgeCount as jest.Mock;

	afterEach(() => {
		mockSetBadgeCountNative.mockClear();
	});

	it('calls the native setBadgeCount', () => {
		setBadgeCount(42);

		expect(mockSetBadgeCountNative).toBeCalledWith(42);
	});
});
