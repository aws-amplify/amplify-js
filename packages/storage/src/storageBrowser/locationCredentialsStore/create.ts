// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	CredentialsLocation,
	GetLocationCredentials,
	LocationCredentialsStore,
} from '../types';
import { StorageValidationErrorCode } from '../../errors/types/validation';
import { assertValidationError } from '../../errors/utils/assertValidationError';
import {
	BucketLocation,
	LocationCredentialsProvider,
} from '../../providers/s3/types/options';

import { createStore, getValue, removeStore } from './registry';
import { validateCredentialsProviderLocation } from './validators';

export const createLocationCredentialsStore = (input: {
	handler: GetLocationCredentials;
}): LocationCredentialsStore => {
	const storeSymbol = createStore(input.handler);

	const store = {
		getProvider(providerLocation: CredentialsLocation) {
			const locationCredentialsProvider = async ({
				permission,
				locations,
				forceRefresh = false,
			}: Parameters<LocationCredentialsProvider>[0]) => {
				const actionBucketLocation = resolveCommonBucketLocation(locations);
				const providerBucketLocation = parseS3Uri(providerLocation.scope);
				validateCredentialsProviderLocation(
					{
						...actionBucketLocation,
						permission,
					},
					{
						...providerBucketLocation,
						permission: providerLocation.permission,
					},
				);

				return getValue({
					storeSymbol,
					location: { ...providerLocation },
					forceRefresh,
				});
			};

			return locationCredentialsProvider;
		},

		destroy() {
			removeStore(storeSymbol);
		},
	};

	return store;
};

type S3Uri = string;

const parseS3Uri = (uri: S3Uri): BucketLocation => {
	const s3UrlSchemaRegex = /^s3:\/\//;
	// TODO(@AllanZhengYP): Provide more info to error message: url
	assertValidationError(
		s3UrlSchemaRegex.test(uri),
		StorageValidationErrorCode.InvalidS3Uri,
	);
	const [bucket, ...pathParts] = uri.replace(s3UrlSchemaRegex, '').split('/');
	assertValidationError(!!bucket, StorageValidationErrorCode.InvalidS3Uri);
	const path = pathParts.join('/');

	return {
		bucket,
		path,
	};
};

/**
 * Given a list of bucket and path combinations, verify they have the same
 * bucket and resolves the longest common prefix for multiple given paths.
 */
const resolveCommonBucketLocation = (
	locations: BucketLocation[],
): BucketLocation => {
	let { bucket: commonBucket, path: commonPath } = locations[0];

	for (const location of locations) {
		const { bucket, path } = location;
		assertValidationError(
			bucket === commonBucket,
			StorageValidationErrorCode.LocationCredentialsCrossBucket,
		);
		while (commonPath !== '' && !path.startsWith(commonPath)) {
			commonPath = commonPath.slice(0, -1);
		}
	}

	return {
		bucket: commonBucket,
		path: commonPath,
	};
};
