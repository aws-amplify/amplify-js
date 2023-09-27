// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { enable } from '../../src/apis';
import { enableAnalytics, disableAnalytics } from '../../src/utils';

jest.mock('../../src/utils');

describe('Pinpoint APIs: enable', () => {
	const mockEnableAnalytics = enableAnalytics as jest.Mock;
	const mockDisableAnalytics = disableAnalytics as jest.Mock;

	beforeEach(() => {
		mockEnableAnalytics.mockReset();
		mockDisableAnalytics.mockReset();
	});

	it('should enable Analytics', () => {
		enable();

		expect(mockEnableAnalytics).toBeCalledTimes(1);
		expect(mockDisableAnalytics).not.toBeCalled();
	});
});
