// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

import { ListPathsOutput } from '../../types/credentials';

import { resolveLocationsForCurrentSession } from './resolveLocationsForCurrentSession';
import { getHighestPrecedenceUserGroup } from './getHighestPrecedenceUserGroup';

export const listPaths = async (
	ctx: AmplifyContext,
): Promise<ListPathsOutput> => {
	const { buckets } = ctx.resourcesConfig.Storage!.S3!;
	const { groups } = ctx.resourcesConfig.Auth!.Cognito;

	if (!buckets) {
		return { locations: [] };
	}

	const { tokens, identityId } = await ctx.fetchAuthSession({});
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
