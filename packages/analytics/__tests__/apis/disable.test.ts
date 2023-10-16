// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { disable } from '../../src/apis';
import { disableAnalytics } from '../../src/utils';

jest.mock('../../src/utils');

describe('Pinpoint APIs: disable', () => {
	const mockDisableAnalytics = disableAnalytics as jest.Mock;

	beforeEach(() => {
		mockDisableAnalytics.mockReset();
	});

	it('should disable Analytics', () => {
		disable();

		expect(mockDisableAnalytics).toBeCalledTimes(1);
	});
});
