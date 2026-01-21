// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageAction } from '@aws-amplify/core/internals/utils';

import { listObjectsV2 } from './client/s3data';
import { getStorageUserAgentValue } from './userAgent';

export interface IsPathFolderParams {
	s3Config: any;
	bucket: string;
	key: string;
	expectedBucketOwner?: string;
}

/**
 * Determines if a given S3 key represents a folder by checking if objects exist with that prefix.
 *
 * @param params - Configuration object for the folder check
 * @returns Promise that resolves to true if the key represents a folder, false otherwise
 */
export const isPathFolder = async (
	params: IsPathFolderParams,
): Promise<boolean> => {
	const { s3Config, bucket, key, expectedBucketOwner } = params;
	try {
		const prefix = key.endsWith('/') ? key : `${key}/`;

		const result = await listObjectsV2(
			{
				...s3Config,
				userAgentValue: getStorageUserAgentValue(StorageAction.Remove),
			},
			{
				Bucket: bucket,
				Prefix: prefix,
				MaxKeys: 1,
				ExpectedBucketOwner: expectedBucketOwner,
			},
		);

		const isFolder =
			!!(result.Contents && result.Contents.length > 0) ||
			!!(result.CommonPrefixes && result.CommonPrefixes.length > 0);

		return isFolder;
	} catch (error) {
		return false;
	}
};
