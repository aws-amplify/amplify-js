// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable no-console */

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import {
	RemoveInput,
	RemoveOperation,
	RemoveOutput,
	RemoveWithPathOutput,
} from '../../types';
import {
	resolveS3ConfigAndInput,
	validateBucketOwnerID,
	validateStorageOperationInput,
} from '../../utils';
import {
	deleteObject,
	deleteObjects,
	listObjectsV2,
} from '../../utils/client/s3data';
import { calculateContentMd5 } from '../../utils/md5';
import { getStorageUserAgentValue } from '../../utils/userAgent';
import { STORAGE_INPUT_KEY } from '../../utils/constants';
// TODO: Remove this interface when we move to public advanced APIs.
import { RemoveInput as RemoveWithPathInputWithAdvancedOptions } from '../../../../internals';

/**
 * Internal class to manage cancellation state
 */
class CancellationToken {
	private _isCancelled = false;

	cancel(): void {
		this._isCancelled = true;
	}

	isCancelled(): boolean {
		return this._isCancelled;
	}
}

export const remove = (
	amplify: AmplifyClassV6,
	input: RemoveInput | RemoveWithPathInputWithAdvancedOptions,
): RemoveOperation => {
	const cancellationToken = new CancellationToken();
	const resultPromise = executeRemove(amplify, input, cancellationToken);

	const operation: RemoveOperation = {
		result: resultPromise,
		cancel: () => {
			cancellationToken.cancel();
		},
		then: resultPromise.then.bind(resultPromise),
		catch: resultPromise.catch.bind(resultPromise),
	};

	return operation;
};

async function executeRemove(
	amplify: AmplifyClassV6,
	input: RemoveInput | RemoveWithPathInputWithAdvancedOptions,
	cancellationToken: CancellationToken,
): Promise<RemoveOutput | RemoveWithPathOutput> {
	const { s3Config, keyPrefix, bucket, identityId } =
		await resolveS3ConfigAndInput(amplify, input);

	const { inputType, objectKey } = validateStorageOperationInput(
		input,
		identityId,
	);
	validateBucketOwnerID(input.options?.expectedBucketOwner);

	let finalKey: string;
	if (inputType === STORAGE_INPUT_KEY) {
		finalKey = `${keyPrefix}${objectKey}`;
	} else {
		finalKey = objectKey;
	}

	// Validate dangerous paths
	const DANGEROUS_PATHS = ['', '/', '*'];
	if (DANGEROUS_PATHS.includes(finalKey.trim())) {
		throw new Error('Cannot delete root or bucket-wide paths');
	}

	// Check if this is a folder operation
	console.log('🔍🔍🔍 ABOUT TO CALL detectFolder 🔍🔍🔍');
	const isFolder = await detectFolder(
		s3Config,
		bucket,
		finalKey,
		input.options?.expectedBucketOwner,
	);

	if (isFolder) {
		// Handle folder deletion
		const result = await deleteFolderContents(
			s3Config,
			bucket,
			finalKey,
			input.options || {},
			cancellationToken,
		);

		const finalResult =
			inputType === STORAGE_INPUT_KEY
				? { key: objectKey, isFolder: true, ...result }
				: { path: objectKey, isFolder: true, ...result };

		return finalResult;
	} else {
		// Handle single file deletion (existing behavior)
		if (cancellationToken.isCancelled()) {
			return inputType === STORAGE_INPUT_KEY
				? { key: objectKey }
				: { path: objectKey };
		}

		await deleteObject(
			{
				...s3Config,
				userAgentValue: getStorageUserAgentValue(StorageAction.Remove),
			},
			{
				Bucket: bucket,
				Key: finalKey,
				ExpectedBucketOwner: input.options?.expectedBucketOwner,
			},
		);

		return inputType === STORAGE_INPUT_KEY
			? { key: objectKey }
			: { path: objectKey };
	}
}

async function detectFolder(
	s3Config: any,
	bucket: string,
	key: string,
	expectedBucketOwner?: string,
): Promise<boolean> {
	// If key ends with '/', it's explicitly a folder
	if (key.endsWith('/')) {
		return true;
	}

	// Check if there are objects with this prefix
	const prefix = key.endsWith('/') ? key : `${key}/`;

	try {
		const result = await listObjectsV2(s3Config, {
			Bucket: bucket,
			Prefix: prefix,
			MaxKeys: 1,
			ExpectedBucketOwner: expectedBucketOwner,
		});

		const isFolder = (result.Contents && result.Contents.length > 0) || false;

		return isFolder;
	} catch (error) {
		console.error('📋📋📋 listObjectsV2 ERROR 📋📋📋');
		console.error('Error details:', error);
		console.error(
			'Error stack:',
			error instanceof Error ? error.stack : 'No stack',
		);

		// If listing fails, assume it's a file

		return false;
	}
}

async function deleteFolderContents(
	s3Config: any,
	bucket: string,
	folderKey: string,
	options: any,
	cancellationToken: CancellationToken,
): Promise<Partial<RemoveWithPathOutput>> {
	const batchSize = Math.min(options.batchSize || 1000, 1000);
	const errorHandling = options.errorHandling || 'throw';
	const listingStrategy = options.listingStrategy || 'stream';

	const prefix = folderKey.endsWith('/') ? folderKey : `${folderKey}/`;

	let totalFiles = 0;
	let deletedCount = 0;
	let failedCount = 0;
	const failed: { key: string; error: string }[] = [];

	if (listingStrategy === 'list-all-first') {
		// Strategy 1: List all objects first, then delete in batches
		const allKeys = await listAllObjects(
			s3Config,
			bucket,
			prefix,
			options.expectedBucketOwner,
		);
		totalFiles = allKeys.length;

		// Validate expected count
		if (options.expectedFileCount && totalFiles !== options.expectedFileCount) {
			throw new Error(
				`Expected ${options.expectedFileCount} files but found ${totalFiles}`,
			);
		}

		const batches = chunkArray(allKeys, batchSize);
		const totalBatches = batches.length;

		for (let i = 0; i < batches.length; i++) {
			if (cancellationToken.isCancelled()) {
				break;
			}

			const batch = batches[i];
			const batchResult = await deleteBatch(
				s3Config,
				bucket,
				batch,
				options.expectedBucketOwner,
			);

			deletedCount += batchResult.deleted.length;
			failedCount += batchResult.failed.length;
			failed.push(...batchResult.failed);

			if (options.onProgress) {
				options.onProgress({
					totalFiles,
					deletedCount,
					failedCount,
					currentBatch: i + 1,
					totalBatches,
				});
			}

			if (batchResult.failed.length > 0 && errorHandling === 'throw') {
				throw new Error(
					`Batch deletion failed: ${batchResult.failed[0].error}`,
				);
			}
		}
	} else {
		// Strategy 2: Stream - list and delete in parallel
		let continuationToken: string | undefined;
		let currentBatch = 0;

		do {
			if (cancellationToken.isCancelled()) {
				break;
			}

			const listResult = await listObjectsV2(s3Config, {
				Bucket: bucket,
				Prefix: prefix,
				MaxKeys: batchSize,
				ContinuationToken: continuationToken,
				ExpectedBucketOwner: options.expectedBucketOwner,
			});

			if (listResult.Contents && listResult.Contents.length > 0) {
				const keys = listResult.Contents.map(obj => obj.Key!).filter(Boolean);
				totalFiles += keys.length;
				currentBatch++;

				const batchResult = await deleteBatch(
					s3Config,
					bucket,
					keys,
					options.expectedBucketOwner,
				);

				deletedCount += batchResult.deleted.length;
				failedCount += batchResult.failed.length;
				failed.push(...batchResult.failed);

				if (options.onProgress) {
					options.onProgress({
						totalFiles,
						deletedCount,
						failedCount,
						currentBatch,
						totalBatches: -1, // Unknown in stream mode
					});
				}

				if (batchResult.failed.length > 0 && errorHandling === 'throw') {
					throw new Error(
						`Batch deletion failed: ${batchResult.failed[0].error}`,
					);
				}
			}

			continuationToken = listResult.NextContinuationToken;
		} while (continuationToken && !cancellationToken.isCancelled());
	}

	// Delete folder marker if it exists
	if (!cancellationToken.isCancelled()) {
		try {
			await deleteObject(
				{
					...s3Config,
					userAgentValue: getStorageUserAgentValue(StorageAction.Remove),
				},
				{
					Bucket: bucket,
					Key: prefix,
					ExpectedBucketOwner: options.expectedBucketOwner,
				},
			);
		} catch (error) {
			// Folder marker might not exist, ignore error
		}
	}

	return {
		summary: {
			totalFiles,
			deletedCount,
			failedCount,
		},
		failed: failed.length > 0 ? failed : undefined,
	};
}

async function listAllObjects(
	s3Config: any,
	bucket: string,
	prefix: string,
	expectedBucketOwner?: string,
): Promise<string[]> {
	const allKeys: string[] = [];
	let continuationToken: string | undefined;

	do {
		const result = await listObjectsV2(s3Config, {
			Bucket: bucket,
			Prefix: prefix,
			MaxKeys: 1000,
			ContinuationToken: continuationToken,
			ExpectedBucketOwner: expectedBucketOwner,
		});

		if (result.Contents) {
			allKeys.push(...result.Contents.map(obj => obj.Key!).filter(Boolean));
		}

		continuationToken = result.NextContinuationToken;
	} while (continuationToken);

	return allKeys;
}

async function deleteBatch(
	s3Config: any,
	bucket: string,
	keys: string[],
	expectedBucketOwner?: string,
): Promise<{ deleted: string[]; failed: { key: string; error: string }[] }> {
	if (keys.length === 0) {
		return { deleted: [], failed: [] };
	}

	try {
		const result = await deleteObjects(
			{
				...s3Config,
				userAgentValue: getStorageUserAgentValue(StorageAction.Remove),
			},
			{
				Bucket: bucket,
				Delete: {
					Objects: keys.map(key => ({ Key: key })),
					Quiet: false,
				},
				ExpectedBucketOwner: expectedBucketOwner,
				ContentMD5: await calculateContentMd5(
					`<?xml version="1.0" encoding="UTF-8"?>
<Delete xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
	<Quiet>false</Quiet>
	${keys.map(key => `<Object><Key>${key}</Key></Object>`).join('')}
</Delete>`,
				),
			},
		);

		const deleted =
			result.Deleted?.map(item => item.Key!).filter(Boolean) || [];
		const failed =
			result.Errors?.map(error => ({
				key: error.Key!,
				error: `${error.Code}: ${error.Message}`,
			})) || [];

		return { deleted, failed };
	} catch (error) {
		// If batch delete fails entirely, mark all keys as failed
		return {
			deleted: [],
			failed: keys.map(key => ({
				key,
				error: error instanceof Error ? error.message : 'Unknown error',
			})),
		};
	}
}

function chunkArray<T>(array: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}

	return chunks;
}
