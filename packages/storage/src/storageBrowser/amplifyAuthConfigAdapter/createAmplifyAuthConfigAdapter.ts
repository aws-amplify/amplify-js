// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify, fetchAuthSession } from '@aws-amplify/core';

import { GetLocationCredentials, ListPaths } from '../types';
import { BucketInfo } from '../../providers/s3/types/options';

interface Location {
	type: 'PREFIX';
	permission: string[];
	scope: {
		bucketName: string;
		path: string;
	};
}

export interface AuthConfigAdapter {
	/** outputs Scope(path), permission (read/write/readwrite), type(prefix/bucket/object) */
	listLocations: ListPaths;
	/** basically fetch auth session */
	getLocationCredentials?: GetLocationCredentials;
}

export const createAmplifyAuthConfigAdapter = (): AuthConfigAdapter => {
	const listLocations = createAmplifyListLocationsHandler();

	return { listLocations };
};

const createAmplifyListLocationsHandler = (): ListPaths => {
	return async function listLocations(input = {}) {
		const { buckets } = Amplify.getConfig().Storage!.S3!;

		if (!buckets) {
			return { locations: [] };
		}
		// eslint-disable-next-line no-debugger
		debugger;

		const { tokens, identityId } = await fetchAuthSession();
		const userGroups = tokens?.accessToken.payload['cognito:groups'];

		// eslint-disable-next-line unused-imports/no-unused-vars
		const { pageSize, nextToken } = input;

		const locations = parseBuckets({
			buckets,
			tokens: !!tokens,
			identityId: identityId!,
			userGroup: (userGroups as any)[0], // TODO: fix this edge case
		});

		return { locations };
	};
};

const getPermissions = (
	accessRule: Record<string, string[]>,
	token: boolean,
	groups?: string,
) => {
	if (!token) {
		return {
			permission: accessRule.guest,
		};
	}
	if (groups) {
		const selectedKey = Object.keys(accessRule).find(access =>
			access.includes(groups),
		);

		return {
			permission: selectedKey
				? accessRule[selectedKey]
				: accessRule.authenticated,
		};
	}

	return {
		permission: accessRule.authenticated,
	};
};

const parseBuckets = ({
	buckets,
	tokens,
	identityId,
	userGroup,
}: {
	buckets: Record<string, BucketInfo>;
	tokens: boolean;
	identityId: string;
	userGroup: string;
}): Location[] => {
	const locations: Location[] = [];

	for (const [, bucketInfo] of Object.entries(buckets)) {
		const { bucketName, paths } = bucketInfo;
		for (const [path, accessRules] of Object.entries(paths)) {
			// eslint-disable-next-line no-template-curly-in-string
			if (tokens && path.includes('${cognito-identity.amazonaws.com:sub}')) {
				locations.push({
					type: 'PREFIX', // TODO: update logic to include prefix/object
					permission: accessRules.entityidentity,
					scope: {
						bucketName,
						path: path.replace(
							// eslint-disable-next-line no-template-curly-in-string
							'${cognito-identity.amazonaws.com:sub}',
							identityId,
						),
					},
				});
			}
			const location: Location = {
				type: 'PREFIX',
				...getPermissions(accessRules, tokens, userGroup),
				scope: { bucketName, path },
			};
			if (location.permission) locations.push(location);
		}
	}

	return locations;
};
