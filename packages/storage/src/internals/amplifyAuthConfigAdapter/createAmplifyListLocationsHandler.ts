// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';

import { ListPaths, PathAccess } from '../types/credentials';

import { generateLocationsFromPaths } from './generateLocationsFromPaths';

export const createAmplifyListLocationsHandler = (): ListPaths => {
	const { buckets } = Amplify.getConfig().Storage!.S3!;
	// eslint-disable-next-line no-debugger
	debugger;
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
			return getPaginatedResult({
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

		return getPaginatedResult({
			locations: cachedResult[cacheKey].locations,
			pageSize,
			nextToken,
		});
	};
};

const getPaginatedResult = ({
	locations,
	pageSize,
	nextToken,
}: {
	locations: PathAccess[];
	pageSize?: number;
	nextToken?: string;
}) => {
	if (pageSize) {
		if (nextToken) {
			const start = -nextToken;
			const end = start > pageSize ? start + pageSize : undefined;

			return {
				locations: locations.slice(start, end),
				nextToken: end ? `${end}` : undefined,
			};
		}

		return {
			locations: locations.slice(0, pageSize),
			nextToken:
				locations.length > pageSize
					? `${locations.length - pageSize}`
					: undefined,
		};
	}

	return {
		locations,
	};
};
