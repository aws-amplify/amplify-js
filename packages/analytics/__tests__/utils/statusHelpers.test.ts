// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	enableAnalytics,
	disableAnalytics,
	isAnalyticsEnabled,
} from '../../src/utils';

describe('Analytics Category Util: status utils', () => {
	it('should indicate that Analytics is enabled by default', () => {
		const status = isAnalyticsEnabled();

		expect(status).toBe(true);
	});

	it('correctly toggles the Analytics status', () => {
		let status = isAnalyticsEnabled();
		expect(status).toBe(true);

		disableAnalytics();

		status = isAnalyticsEnabled();
		expect(status).toBe(false);

		enableAnalytics();

		status = isAnalyticsEnabled();
		expect(status).toBe(true);
	});
});
