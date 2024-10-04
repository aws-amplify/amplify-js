// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';

import { ListPaths, ListPathsOutput } from '../types/credentials';

import { generateLocationsFromPaths } from './generateLocationsFromPaths';

export const createAmplifyListLocationsHandler = (): ListPaths => {
	const { buckets } = Amplify.getConfig().Storage!.S3!;
	// eslint-disable-next-line no-debugger
	debugger;
	let cachedResult: Record<string, ListPathsOutput> | null = null;

	return async function listLocations() {
		if (!buckets) {
			return { locations: [] };
		}

		const { tokens, identityId } = await fetchAuthSession();
		const userGroups = tokens?.accessToken.payload['cognito:groups'];
		const cacheKey = JSON.stringify({ identityId, userGroups }) + `${!!tokens}`;

		if (cachedResult && cachedResult[cacheKey]) return cachedResult[cacheKey];

		cachedResult = {};

		const locations = generateLocationsFromPaths({
			buckets,
			tokens: !!tokens,
			identityId,
			userGroup: userGroups && (userGroups as any)[0], // TODO: fix this edge case
		});

		cachedResult[cacheKey] = { locations };

		return cachedResult[cacheKey];
	};
};
