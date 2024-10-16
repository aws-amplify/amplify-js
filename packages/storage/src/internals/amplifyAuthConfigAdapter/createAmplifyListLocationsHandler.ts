// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';

import { ListPaths } from '../types/credentials';

import { resolveLocationsForCurrentSession } from './resolveLocationsForCurrentSession';

export const createAmplifyListLocationsHandler = (): ListPaths => {
	const { buckets } = Amplify.getConfig().Storage!.S3!;

	return async function listLocations() {
		if (!buckets) {
			return { locations: [] };
		}

		const { tokens, identityId } = await fetchAuthSession();
		const userGroups = tokens?.accessToken.payload['cognito:groups'];

		const locations = resolveLocationsForCurrentSession({
			buckets,
			isAuthenticated: !!tokens,
			identityId,
			userGroup: userGroups && (userGroups as any)[0], // TODO: fix this edge case
		});

		return { locations };
	};
};
