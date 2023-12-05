// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { completeNotification } from '../../src/apis/completeNotification';
import { nativeModule } from '../../src/nativeModule';
import { completionHandlerId } from '../testUtils/data';

jest.mock('../../src/nativeModule', () => ({
	nativeModule: {
		completeNotification: jest.fn(),
	},
}));

describe('completeNotification', () => {
	// assert mocks
	const mockCompleteNotificationNative =
		nativeModule.completeNotification as jest.Mock;

	beforeAll(() => {
		mockCompleteNotificationNative.mockResolvedValue(42);
	});

	afterEach(() => {
		mockCompleteNotificationNative.mockClear();
	});

	it('calls the native completeNotification', () => {
		completeNotification(completionHandlerId);

		expect(mockCompleteNotificationNative).toHaveBeenCalledWith(
			completionHandlerId
		);
	});
});
