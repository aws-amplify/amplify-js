// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Cache } from '../../../../src';
import {
	cacheEndpointId,
	getCacheKey,
} from '../../../../src/providers/pinpoint/utils';
import { appId, cacheKey, category, endpointId } from '../testUtils/data';

jest.mock('../../../../src/providers/pinpoint/utils/getCacheKey');

describe('Pinpoint Provider Util: cacheEndpointId', () => {
	// create spies
	const setItemSpy = jest.spyOn(Cache, 'setItem');
	// assert mocks
	const mockGetCacheKey = getCacheKey as jest.Mock;

	beforeAll(() => {
		mockGetCacheKey.mockReturnValue(cacheKey);
	});

	beforeEach(() => {
		setItemSpy.mockClear();
	});

	it('writes an endpoint id to cache', async () => {
		await cacheEndpointId(appId, category, endpointId);
		expect(mockGetCacheKey).toHaveBeenCalledWith(appId, category);
		expect(setItemSpy).toHaveBeenCalledWith(
			cacheKey,
			endpointId,
			expect.objectContaining({ priority: 1 })
		);
	});
});
