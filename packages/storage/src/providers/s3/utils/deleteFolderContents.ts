// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageAction } from '@aws-amplify/core/internals/utils';

import { CanceledError } from '../../../errors/CanceledError';
import { ProgressInfo, RemoveWithPathOutput } from '../types';

import { deleteObjects, listObjectsV2 } from './client/s3data';
import { getStorageUserAgentValue } from './userAgent';

const MAX_KEYS_PER_BATCH = 1000;

export interface DeleteFolderContentsParams {
	s3Config: any;
	bucket: string;
	folderKey: string;
	expectedBucketOwner?: string;
	onProgress?(progress: ProgressInfo): void;
	abortSignal?: AbortSignal;
}

/**
 * Deletes all contents of a folder in S3 using batch operations
 *
 * @param params - Configuration object for the delete operation
 * @returns Promise that resolves to the removal result
 */
export const deleteFolderContents = async (
	params: DeleteFolderContentsParams,
): Promise<RemoveWithPathOutput> => {
	const {
		s3Config,
		bucket,
		folderKey,
		expectedBucketOwner,
		onProgress,
		abortSignal,
	} = params;

	try {
		const prefix = folderKey.endsWith('/') ? folderKey : `${folderKey}/`;
		const progressCallback =
			onProgress ??
			(() => {
				// no-op
			});

		let continuationToken: string | undefined;

		do {
			if (abortSignal?.aborted) {
				throw new CanceledError({ message: 'Operation was canceled' });
			}

			const listResult = await listObjectsV2(
				{
					...s3Config,
					userAgentValue: getStorageUserAgentValue(StorageAction.Remove),
					abortSignal,
				},
				{
					Bucket: bucket,
					Prefix: prefix,
					MaxKeys: MAX_KEYS_PER_BATCH,
					ContinuationToken: continuationToken,
					ExpectedBucketOwner: expectedBucketOwner,
				},
			);

			if (!listResult.Contents || listResult.Contents.length === 0) {
				break;
			}

			if (abortSignal?.aborted) {
				throw new CanceledError({ message: 'Operation was canceled' });
			}

			const batch = listResult.Contents.map(obj => ({ Key: obj.Key! }));

			const deleteResult = await deleteObjects(
				{
					...s3Config,
					userAgentValue: getStorageUserAgentValue(StorageAction.Remove),
					abortSignal,
				},
				{
					Bucket: bucket,
					Delete: {
						Objects: batch,
						Quiet: false,
					},
					ExpectedBucketOwner: expectedBucketOwner,
				},
			);

			const deleted =
				deleteResult.Deleted?.map(obj => ({ path: obj.Key! })) || [];
			const failed =
				deleteResult.Errors?.map(err => ({
					path: err.Key!,
					code: err.Code!,
					message: err.Message!,
				})) || [];

			progressCallback({ deleted, failed });

			continuationToken = listResult.NextContinuationToken;
		} while (continuationToken);

		return { path: folderKey };
	} catch (error) {
		if (abortSignal?.aborted) {
			throw new CanceledError({ message: 'Operation was canceled' });
		}
		throw error;
	}
};
