// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { amplifyUuid } from '../../../utils/amplifyUuid';
import { SupportedCategory } from '../types';

import { getCacheKey } from './getCacheKey';

const createdEndpointIds: Record<string, string> = {};

/**
 * Creates an endpoint id and guarantees multiple creations for a category returns the same uuid.
 *
 * @internal
 */
export const createEndpointId = (
	appId: string,
	category: SupportedCategory,
): string => {
	const cacheKey = getCacheKey(appId, category);
	if (!createdEndpointIds[cacheKey]) {
		createdEndpointIds[cacheKey] = amplifyUuid();
	}

	return createdEndpointIds[cacheKey];
};

/**
 * Clears a created endpoint id for a category.
 *
 * @internal
 */
export const clearCreatedEndpointId = (
	appId: string,
	category: SupportedCategory,
): void => {
	const cacheKey = getCacheKey(appId, category);
	delete createdEndpointIds[cacheKey];
};
