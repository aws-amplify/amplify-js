// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';

import { ListPathsOutput } from '../../types/credentials';

import { resolveLocationsForCurrentSession } from './resolveLocationsForCurrentSession';
import { getHighestPrecedenceUserGroup } from './getHighestPrecedenceUserGroup';

export const listPaths = async (): Promise<ListPathsOutput> => {
	const { buckets } = Amplify.getConfig().Storage!.S3!;
	const { groups } = Amplify.getConfig().Auth!.Cognito;

	if (!buckets) {
		return { locations: [] };
	}

	const { tokens, identityId } = await fetchAuthSession();
	const currentUserGroups = tokens?.accessToken.payload['cognito:groups'] as
		| string[]
		| undefined;

	const userGroupToUse = getHighestPrecedenceUserGroup(
		groups,
		currentUserGroups,
	);

	const locations = resolveLocationsForCurrentSession({
		buckets,
		isAuthenticated: !!tokens,
		identityId,
		userGroup: userGroupToUse,
	});

	return { locations };
};
