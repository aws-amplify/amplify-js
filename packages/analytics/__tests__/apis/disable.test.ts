// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { disable } from '../../src/apis';
import { enableAnalytics, disableAnalytics } from '../../src/utils';

jest.mock('../../src/utils');

describe('Pinpoint APIs: disable', () => {
	const mockEnableAnalytics = enableAnalytics as jest.Mock;
	const mockDisableAnalytics = disableAnalytics as jest.Mock;

	beforeEach(() => {
		mockEnableAnalytics.mockReset();
		mockDisableAnalytics.mockReset();
	});

	it('should disable Analytics', () => {
		disable();

		expect(mockEnableAnalytics).not.toBeCalled();
		expect(mockDisableAnalytics).toBeCalledTimes(1);
	});
});
