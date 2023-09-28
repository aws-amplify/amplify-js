// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { enable } from '../../src/apis';
import { enableAnalytics } from '../../src/utils';

jest.mock('../../src/utils');

describe('Pinpoint APIs: enable', () => {
	const mockEnableAnalytics = enableAnalytics as jest.Mock;

	beforeEach(() => {
		mockEnableAnalytics.mockReset();
	});

	it('should enable Analytics', () => {
		enable();

		expect(mockEnableAnalytics).toBeCalledTimes(1);
	});
});
