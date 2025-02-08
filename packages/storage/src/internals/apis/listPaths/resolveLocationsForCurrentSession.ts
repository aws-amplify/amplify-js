// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { PathAccess, PathPermissions } from '../../types/credentials';
import { BucketInfo } from '../../../providers/s3/types/options';
import { ENTITY_IDENTITY_URL } from '../../utils/constants';

const isPathPermissions = (value: unknown): value is PathPermissions =>
	Array.isArray(value);

const resolvePermissions = (
	accessRules: Record<string, string[] | undefined>,
	isAuthenticated: boolean,
	includeEntityIdPath: boolean,
	userGroup?: string,
): string[] | undefined => {
	if (includeEntityIdPath) {
		return accessRules.entityidentity;
	}
	if (!isAuthenticated) {
		return accessRules.guest;
	}
	if (userGroup) {
		const selectedKey = Object.keys(accessRules).find(access =>
			access.includes(userGroup),
		);

		return selectedKey ? accessRules[selectedKey] : undefined;
	}

	return accessRules.authenticated;
};

export const resolveLocationsForCurrentSession = ({
	buckets,
	isAuthenticated,
	identityId,
	userGroup,
}: {
	buckets: Record<string, BucketInfo>;
	isAuthenticated: boolean;
	identityId?: string;
	userGroup?: string;
}): PathAccess[] => {
	const locations: PathAccess[] = [];

	for (const { bucketName: bucket, paths } of Object.values(buckets)) {
		if (!paths) {
			continue;
		}

		for (const [path, accessRules] of Object.entries(paths)) {
			const includeEntityIdPath =
				!userGroup &&
				path.includes(ENTITY_IDENTITY_URL) &&
				isAuthenticated &&
				!!identityId;

			const permissions = resolvePermissions(
				accessRules,
				isAuthenticated,
				includeEntityIdPath,
				userGroup,
			);

			if (isPathPermissions(permissions)) {
				const prefix = !includeEntityIdPath
					? path
					: path.replace(ENTITY_IDENTITY_URL, identityId);

				locations.push({ bucket, permissions, prefix, type: 'PREFIX' });
			}
		}
	}

	return locations;
};
