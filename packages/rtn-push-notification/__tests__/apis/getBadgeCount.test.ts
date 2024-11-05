// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getBadgeCount } from '../../src/apis/getBadgeCount';
import { nativeModule } from '../../src/nativeModule';

jest.mock('../../src/nativeModule', () => ({
	nativeModule: {
		getBadgeCount: jest.fn(),
	},
}));

describe('getBadgeCount', () => {
	// assert mocks
	const mockGetBadgeCountNative = nativeModule.getBadgeCount as jest.Mock;

	beforeAll(() => {
		mockGetBadgeCountNative.mockResolvedValue(42);
	});

	afterEach(() => {
		mockGetBadgeCountNative.mockClear();
	});

	it('calls the native getBadgeCount', async () => {
		expect(await getBadgeCount()).toBe(42);
		expect(mockGetBadgeCountNative).toHaveBeenCalled();
	});
});
