// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Cache } from '../../../../src';
import {
	getCacheKey,
	getEndpointId,
} from '../../../../src/providers/pinpoint/utils';
import { appId, cacheKey, category, endpointId } from '../testUtils/data';

jest.mock('../../../../src/providers/pinpoint/utils/getCacheKey');

describe('Pinpoint Provider Util: getEndpointId', () => {
	// create spies
	const getItemSpy = jest.spyOn(Cache, 'getItem');
	// assert mocks
	const mockGetCacheKey = getCacheKey as jest.Mock;

	beforeAll(() => {
		mockGetCacheKey.mockReturnValue(cacheKey);
	});

	beforeEach(() => {
		getItemSpy.mockReset();
	});

	it('returns a cached endpoint id', async () => {
		getItemSpy.mockResolvedValue(endpointId);
		expect(await getEndpointId(appId, category)).toBe(endpointId);
		expect(mockGetCacheKey).toHaveBeenCalledWith(appId, category);
		expect(getItemSpy).toHaveBeenCalledWith(cacheKey);
	});

	it('returns undefined if endpoint id not found in cache', async () => {
		getItemSpy.mockResolvedValue(null);
		expect(await getEndpointId(appId, category)).toBeUndefined();
	});
});
