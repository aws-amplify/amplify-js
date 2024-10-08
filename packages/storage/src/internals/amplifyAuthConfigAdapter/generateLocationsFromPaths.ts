// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { PathAccess } from '../types/credentials';
import { BucketInfo } from '../../providers/s3/types/options';
import { ENTITY_IDENTITY_URL } from '../utils/constants';
import { StorageAccess } from '../types/common';

const resolvePermissions = (
	accessRule: Record<string, string[]>,
	token: boolean,
	groups: string[] = [],
) => {
	if (!token) {
		return { permission: accessRule.guest };
	}

	const matchingGroup = groups.find(group =>
		Object.keys(accessRule).some(key => key.includes(group)),
	);

	if (matchingGroup) {
		const selectedKey = Object.keys(accessRule).find(
			access =>
				access.includes(matchingGroup) || access.includes('authenticated'),
		);

		return { permission: selectedKey ? accessRule[selectedKey] : undefined };
	}

	return { permission: accessRule.authenticated };
};

export const generateLocationsFromPaths = ({
	buckets,
	tokens,
	identityId,
	userGroup,
}: {
	buckets: Record<string, BucketInfo>;
	tokens: boolean;
	identityId?: string;
	userGroup?: string[];
}): PathAccess[] => {
	const locations: PathAccess[] = [];

	for (const [, bucketInfo] of Object.entries(buckets)) {
		const { bucketName, paths } = bucketInfo;
		if (!paths) {
			// Todo: Verify behavior
			return locations;
		}
		for (const [path, accessRules] of Object.entries(paths)) {
			if (tokens && identityId && path.includes(ENTITY_IDENTITY_URL)) {
				locations.push({
					type: 'PREFIX',
					permission: accessRules.entityidentity as StorageAccess[],
					scope: {
						bucketName,
						path: path.replace(ENTITY_IDENTITY_URL, identityId),
					},
				});
			}
			const location = {
				type: 'PREFIX',
				...resolvePermissions(accessRules, tokens, userGroup),
				scope: { bucketName, path },
			};
			if (location.permission) locations.push(location as PathAccess);
		}
	}

	return locations;
};
