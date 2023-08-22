// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getCacheKey } from '../../../../src/providers/pinpoint/utils';
import { appId, category } from '../testUtils/data';

describe('Pinpoint Provider Util: getCacheKey', () => {
	it('returns a cache key', async () => {
		expect(getCacheKey(appId, category)).toBe('Analytics:pinpoint:app-id');
	});
});
