// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { PathAccess } from '../../types/credentials';
import { BucketInfo } from '../../../providers/s3/types/options';
import { ENTITY_IDENTITY_URL } from '../../utils/constants';
import { StorageAccess } from '../../types/common';

const resolvePermissions = (
	accessRule: Record<string, string[] | undefined>,
	isAuthenticated: boolean,
	groups?: string,
) => {
	if (!isAuthenticated) {
		return {
			permission: accessRule.guest,
		};
	}
	if (groups) {
		const selectedKey = Object.keys(accessRule).find(access =>
			access.includes(groups),
		);

		return {
			permission: selectedKey ? accessRule[selectedKey] : undefined,
		};
	}

	return {
		permission: accessRule.authenticated,
	};
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

	for (const [, bucketInfo] of Object.entries(buckets)) {
		const { bucketName, paths } = bucketInfo;
		if (!paths) {
			continue;
		}

		for (const [path, accessRules] of Object.entries(paths)) {
			const shouldIncludeEntityIdPath =
				!userGroup &&
				path.includes(ENTITY_IDENTITY_URL) &&
				isAuthenticated &&
				identityId;

			if (shouldIncludeEntityIdPath) {
				locations.push({
					type: 'PREFIX',
					permission: accessRules.entityidentity as StorageAccess[],
					bucket: bucketName,
					prefix: path.replace(ENTITY_IDENTITY_URL, identityId),
				});
			}

			const location = {
				type: 'PREFIX',
				...resolvePermissions(accessRules, isAuthenticated, userGroup),
				bucket: bucketName,
				prefix: path,
			};

			if (location.permission) locations.push(location as PathAccess);
		}
	}

	return locations;
};
