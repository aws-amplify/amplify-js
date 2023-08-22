// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Cache } from '../../..';
import { SupportedCategory } from '../types';
import { getCacheKey } from './helpers';

/**
 * Determines if an endpoint ID already exists for the specified app & category.
 *
 * @internal
 */
export const hasEndpointId = async (
	appId: string,
	category: SupportedCategory
): Promise<boolean> => {
	const cacheKey = getCacheKey(appId, category);
	const cachedEndpointId = await Cache.getItem(cacheKey);
	
	return cachedEndpointId ? true : false;
};
