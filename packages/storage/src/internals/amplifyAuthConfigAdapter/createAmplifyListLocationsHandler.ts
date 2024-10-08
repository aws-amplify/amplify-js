// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';

import { ListPaths, PathAccess } from '../types/credentials';

import { generateLocationsFromPaths } from './generateLocationsFromPaths';
import { getPaginatedLocations } from './getPaginatedLocations';

export const createAmplifyListLocationsHandler = (): ListPaths => {
	const { buckets } = Amplify.getConfig().Storage!.S3!;

	let cachedResult: Record<string, { locations: PathAccess[] }> | null = null;

	return async function listLocations(input = {}) {
		if (!buckets) {
			return { locations: [] };
		}
		const { pageSize, nextToken } = input;

		const { tokens, identityId } = await fetchAuthSession();
		const userGroups = tokens?.accessToken.payload['cognito:groups'];
		const cacheKey = JSON.stringify({ identityId, userGroups }) + `${!!tokens}`;

		if (cachedResult && cachedResult[cacheKey])
			return getPaginatedLocations({
				locations: cachedResult[cacheKey].locations,
				pageSize,
				nextToken,
			});

		cachedResult = {};

		const locations = generateLocationsFromPaths({
			buckets,
			tokens: !!tokens,
			identityId,
			userGroup: userGroups as any, // TODO: fix this edge case
		});

		cachedResult[cacheKey] = { locations };

		return getPaginatedLocations({
			locations: cachedResult[cacheKey].locations,
			pageSize,
			nextToken,
		});
	};
};
