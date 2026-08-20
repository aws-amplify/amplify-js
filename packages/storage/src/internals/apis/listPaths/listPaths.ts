// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { ListPathsOutput } from '../../types/credentials';

import { resolveLocationsForCurrentSession } from './resolveLocationsForCurrentSession';
import { getHighestPrecedenceUserGroup } from './getHighestPrecedenceUserGroup';

export const listPaths = async (
	ctx: AmplifyContext,
): Promise<ListPathsOutput> => {
	const { Storage, Auth } = ctx.resourcesConfig;

	const s3Config = Storage?.S3;
	assertValidationError(!!s3Config, StorageValidationErrorCode.NoS3Config);

	const authConfig = Auth?.Cognito;
	assertValidationError(!!authConfig, StorageValidationErrorCode.NoAuthConfig);

	const { buckets } = s3Config;
	const { groups } = authConfig;

	if (!buckets) {
		return { locations: [] };
	}

	const { tokens, identityId } = await ctx.fetchAuthSession();
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
