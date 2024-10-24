// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';

import { ListPaths, PathAccess } from '../types/credentials';

import { getPaginatedLocations } from './getPaginatedLocations';
import { resolveLocationsForCurrentSession } from './resolveLocationsForCurrentSession';
import { getHighestPrecedenceUserGroup } from './getHighestPrecedenceUserGroup';

export const createAmplifyListLocationsHandler = (): ListPaths => {
	const { buckets } = Amplify.getConfig().Storage!.S3!;
	const { groups } = Amplify.getConfig().Auth!.Cognito;

	let cachedResult: Record<string, { locations: PathAccess[] }> | null = null;

	return async function listLocations(input = {}) {
		if (!buckets) {
			return { locations: [] };
		}
		const { pageSize, nextToken } = input;

		const { tokens, identityId } = await fetchAuthSession();
		const currentUserGroups = tokens?.accessToken.payload['cognito:groups'] as
			| string[]
			| undefined;

		const userGroupToUse = getHighestPrecedenceUserGroup(
			groups,
			currentUserGroups,
		);

		const cacheKey =
			JSON.stringify({ identityId, userGroup: userGroupToUse }) + `${!!tokens}`;

		if (cachedResult && cachedResult[cacheKey])
			return getPaginatedLocations({
				locations: cachedResult[cacheKey].locations,
				pageSize,
				nextToken,
			});

		cachedResult = {};

		const locations = resolveLocationsForCurrentSession({
			buckets,
			isAuthenticated: !!tokens,
			identityId,
			userGroup: userGroupToUse,
		});

		cachedResult[cacheKey] = { locations };

		return getPaginatedLocations({
			locations: cachedResult[cacheKey].locations,
			pageSize,
			nextToken,
		});
	};
};
