// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Cache } from '../../../Cache';
import { SupportedCategory } from '../types';
import { getCacheKey } from './getCacheKey';

/**
 * Returns an endpoint id from cache or `undefined` if not found.
 *
 * @internal
 */
export const getEndpointId = async (
	appId: string,
	category: SupportedCategory
): Promise<string | undefined> => {
	const cacheKey = getCacheKey(appId, category);
	const cachedEndpointId = await Cache.getItem(cacheKey);
	return cachedEndpointId ?? undefined;
};
