/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable unused-imports/no-unused-imports */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { BucketLocation, Permission } from '../../providers/s3/types/options';

type S3Url = string;

/**
 *
 * @internal
 */
export const parseS3Url = (url: S3Url): BucketLocation => {
	const s3UrlSchemaRegex = /^s3:\/\//;
	if (!s3UrlSchemaRegex.test(url)) {
		// TODO(@AllanZhengYP) Create associate validation error
		throw new Error(`Invalid S3 URL: ${url}`);
	}
	const [bucket, ...pathParts] = url.replace(s3UrlSchemaRegex, '').split('/');
	const path = pathParts.join('/');

	return {
		bucket,
		path,
	};
};

/**
 * Resolve the location access scope for multiple bucket and path combinations.
 * the lowest common ancestor for multiple given bucket and path combinations, and return
 * a s3 URL. The root URL is 's3://'
 *
 * @internal
 */
export const resolveCommonPrefix = (
	locations: BucketLocation[],
): BucketLocation => {
	if (locations.length === 0) {
		// TODO(@AllanZhengYP) Create associate validation error
		throw new Error(
			'Expect the locations for location credentials provider to be not empty',
		);
	}
	let { bucket: commonBucket, path: commonPath } = locations[0];

	for (const location of locations) {
		const { bucket, path } = location;
		if (bucket !== commonBucket) {
			// TODO(@AllanZhengYP) Create associate validation error
			throw new Error('Location specific credentials cannot be cross-bucket');
		}
		while (!path.startsWith(commonPath)) {
			commonPath = commonPath.slice(0, -1);
		}
	}

	return {
		bucket: commonBucket,
		path: commonPath,
	};
};

/**
 *
 * @internal
 */
export const validateScopeBucket = (input: {
	actionBucket: string;
	providerBucket?: string;
}): void => {
	const { actionBucket, providerBucket } = input;
	if (!providerBucket) {
		return;
	}
	if (actionBucket !== providerBucket) {
		// TODO(@AllanZhengYP) Create associate validation error
		throw new Error(
			`Bucket mismatch. API needs bucket ${actionBucket}, but provided location ` +
				`credentials provider with bucket ${providerBucket}`,
		);
	}
};

export const validateScopePath = (input: {
	actionPath: string;
	providerPath?: string;
}): void => {
	const { actionPath, providerPath } = input;
	if (!providerPath) {
		return;
	}
	if (providerPath.endsWith('*')) {
		// Verify if the action path has prefix required by the provider;
		const providerPathNoWildcard = providerPath.replace(/\*$/, '');
		if (!actionPath.startsWith(providerPathNoWildcard)) {
			// TODO(@AllanZhengYP) Create associate validation error
			throw new Error(
				`Path mismatch. API needs prefix ${actionPath}, but provided location ` +
					`credentials provider with path ${providerPath}`,
			);
		}
	} else if (actionPath !== providerPath) {
		// If provider path is scoped to an object, verify if the action path points to the same object.
		// TODO(@AllanZhengYP) Create associate validation error
		throw new Error(
			`Path mismatch. API needs object scope ${actionPath}, but provided location ` +
				`credentials provider with object scope ${providerPath}`,
		);
	}
};

export const validateScopePermission = (input: {
	actionPermission: Permission;
	providerPermission?: Permission;
}) => {
	const { actionPermission, providerPermission } = input;
	if (!providerPermission) {
		return;
	}
	if (!providerPermission.includes(actionPermission)) {
		// TODO(@AllanZhengYP) Create associate validation error
		throw new Error(
			`Permissions mismatch. API needs permission ${actionPermission}, but provided location ` +
				`credentials provider with permission ${providerPermission}`,
		);
	}
};
