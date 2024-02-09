// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getLaunchNotification } from '../../src/apis/getLaunchNotification';
import { nativeModule } from '../../src/nativeModule';
import { normalizeNativeMessage } from '../../src/utils';
import { nativeMessage } from '../testUtils/data';

jest.mock('../../src/nativeModule', () => ({
	nativeModule: {
		getLaunchNotification: jest.fn(),
	},
}));
jest.mock('../../src/utils');

describe('getLaunchNotification', () => {
	// assert mocks
	const mockGetLaunchNotificationNative =
		nativeModule.getLaunchNotification as jest.Mock;
	const mockNormalizeNativeMessage = normalizeNativeMessage as jest.Mock;

	afterEach(() => {
		mockGetLaunchNotificationNative.mockReset();
		mockNormalizeNativeMessage.mockReset();
	});

	it('calls the native getLaunchNotification', async () => {
		mockNormalizeNativeMessage.mockImplementation(message => ({
			...message,
			body: `normalized-${message.body}`,
		}));
		mockGetLaunchNotificationNative.mockResolvedValue(nativeMessage);

		expect(await getLaunchNotification()).toStrictEqual(
			expect.objectContaining({
				body: `normalized-${nativeMessage.body}`,
			})
		);
		expect(mockGetLaunchNotificationNative).toHaveBeenCalled();
		expect(mockNormalizeNativeMessage).toHaveBeenCalledWith(nativeMessage);
	});

	it('can handle a null value', async () => {
		mockNormalizeNativeMessage.mockImplementation(() => null);
		mockGetLaunchNotificationNative.mockResolvedValue(null);

		expect(await getLaunchNotification()).toBeNull();
		expect(mockGetLaunchNotificationNative).toHaveBeenCalled();
		expect(mockNormalizeNativeMessage).toHaveBeenCalledWith(undefined);
	});
});
