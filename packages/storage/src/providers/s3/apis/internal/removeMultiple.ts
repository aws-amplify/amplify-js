// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import {
	RemoveMultipleInput,
	RemoveMultipleOperation,
	RemoveMultipleOutput,
} from '../../types';
import {
	calculateContentMd5,
	resolveS3ConfigAndInput,
	validateBucketOwnerID,
} from '../../utils';
import { deleteObjects } from '../../utils/client/s3data';
import { getStorageUserAgentValue } from '../../utils/userAgent';
import { logger } from '../../../../utils';

/**
 * Internal class to manage cancellation state
 */
class CancellationToken {
	private _isCancelled = false;

	/**
	 * Mark the operation as cancelled
	 * Idempotent - safe to call multiple times
	 */
	cancel(): void {
		this._isCancelled = true;
	}

	/**
	 * Check if cancellation has been requested
	 */
	isCancelled(): boolean {
		return this._isCancelled;
	}
}

interface ValidationError extends Error {
	type: string;
	key?: string;
	index?: number;
}

interface BatchResult {
	batchNumber: number;
	successful: { key: string; versionId?: string; deletedAt: Date }[];
	failed: {
		key: string;
		versionId?: string;
		error: { code: string; message: string };
	}[];
	hasErrors: boolean;
	retryAttempts: number;
}

export const removeMultiple = (
	amplify: AmplifyClassV6,
	input: RemoveMultipleInput,
): RemoveMultipleOperation => {
	// Validate input
	validateInput(input);

	// Create cancellation token
	const cancellationToken = new CancellationToken();

	// Start the async operation
	const resultPromise = executeRemoveMultiple(
		amplify,
		input,
		cancellationToken,
	);

	// Return operation handle
	return {
		result: resultPromise,
		cancel: () => {
			cancellationToken.cancel();
		},
		isCancelled: () => cancellationToken.isCancelled(),
	};
};

async function executeRemoveMultiple(
	amplify: AmplifyClassV6,
	input: RemoveMultipleInput,
	cancellationToken: CancellationToken,
): Promise<RemoveMultipleOutput> {
	// @ts-expect-error input type
	const { s3Config, bucket } = await resolveS3ConfigAndInput(amplify, input);

	validateBucketOwnerID(input.options?.expectedBucketOwner);

	// Deduplicate keys
	const uniqueKeys = deduplicateKeys(input.keys);

	logger.debug(`removing ${uniqueKeys.length} objects from bucket "${bucket}"`);

	// Initialize results tracking
	const results = {
		deleted: [],
		failed: [],
		cancelled: [],
		batchesProcessed: 0,
		batchesFailed: 0,
	};

	// Split into batches
	const batchSize = input.options?.batchSize || 1000;
	const batches = chunkArray(uniqueKeys, batchSize);

	try {
		// Process batches based on strategy
		if (input.options?.batchStrategy === 'parallel') {
			await processParallel(
				batches,
				input,
				s3Config,
				bucket,
				cancellationToken,
				results,
			);
		} else {
			await processSequential(
				batches,
				input,
				s3Config,
				bucket,
				cancellationToken,
				results,
			);
		}
	} catch (error) {
		// If error occurs and operation was cancelled, treat as cancellation
		if (cancellationToken.isCancelled()) {
			return buildOutput(results, uniqueKeys.length, true);
		}

		// If errorHandling is 'throw' and NOT cancelled, rethrow
		if (input.options?.errorHandling === 'throw') {
			throw error;
		}

		// Otherwise return partial results
		return buildOutput(results, uniqueKeys.length, false);
	}

	return buildOutput(
		results,
		uniqueKeys.length,
		cancellationToken.isCancelled(),
	);
}

function validateInput(input: RemoveMultipleInput): void {
	if (!input.keys || input.keys.length === 0) {
		throw new Error('Keys array cannot be empty');
	}

	const dangerousPatterns = ['', '/', '*', '.', '..'];

	input.keys.forEach((item, index) => {
		const trimmedKey = item.key.trim();

		if (trimmedKey === '' || dangerousPatterns.includes(trimmedKey)) {
			const error = new Error(
				`Dangerous key detected at index ${index}: "${item.key}". Root folder or bucket-wide deletion is not allowed.`,
			) as ValidationError;
			error.type = 'ROOT_FOLDER';
			error.key = item.key;
			error.index = index;
			throw error;
		}

		if (trimmedKey.includes('*')) {
			const error = new Error(
				`Wildcard pattern detected at index ${index}: "${item.key}". Wildcard deletions are not allowed.`,
			) as ValidationError;
			error.type = 'DANGEROUS_PATTERN';
			error.key = item.key;
			error.index = index;
			throw error;
		}
	});

	if (
		input.options?.batchSize &&
		(input.options.batchSize < 1 || input.options.batchSize > 1000)
	) {
		throw new Error('Batch size must be between 1 and 1000');
	}
}

function deduplicateKeys(
	keys: { key: string; versionId?: string }[],
): { key: string; versionId?: string }[] {
	const seen = new Set<string>();

	return keys.filter(item => {
		const identifier = `${item.key}::${item.versionId || 'null'}`;
		if (seen.has(identifier)) {
			return false;
		}
		seen.add(identifier);

		return true;
	});
}

function chunkArray<T>(array: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}

	return chunks;
}

async function processSequential(
	batches: { key: string; versionId?: string }[][],
	input: RemoveMultipleInput,
	s3Config: any,
	bucket: string,
	cancellationToken: CancellationToken,
	results: any,
): Promise<void> {
	for (let i = 0; i < batches.length; i++) {
		// CHECK 1: Before processing each batch
		if (cancellationToken.isCancelled()) {
			// Mark all remaining batches as cancelled
			markRemainingBatchesAsCancelled(batches, i, results);
		}

		const batch = batches[i];

		// Process batch with retry logic (pass cancellation token)
		const result = await processBatchWithRetry(
			batch,
			i + 1,
			input,
			s3Config,
			bucket,
			cancellationToken,
		);

		// Update results
		results.deleted.push(...result.successful);
		results.failed.push(...result.failed);
		results.batchesProcessed++;
		if (result.hasErrors) {
			results.batchesFailed++;
		}

		// Call progress callback (only if not cancelled)
		if (input.options?.onProgress && !cancellationToken.isCancelled()) {
			input.options.onProgress(
				buildProgressInfo(i + 1, batches.length, results, result),
			);
		}

		// Handle errors based on strategy
		if (result.hasErrors) {
			if (
				input.options?.errorHandling === 'throw' &&
				!cancellationToken.isCancelled()
			) {
				throw new Error(`Batch ${result.batchNumber} processing failed`);
			} else if (input.options?.errorHandling === 'failEarly') {
				markRemainingBatchesAsCancelled(batches, i + 1, results);

				return;
			}
		}

		// CHECK 2: Before applying delay
		if (i < batches.length - 1 && input.options?.delayBetweenBatchesMs) {
			// Use cancellable sleep
			const cancelled = await sleepWithCancellation(
				input.options.delayBetweenBatchesMs,
				cancellationToken,
			);

			if (cancelled) {
				markRemainingBatchesAsCancelled(batches, i + 1, results);

				return;
			}
		}
	}
}

async function processParallel(
	batches: { key: string; versionId?: string }[][],
	input: RemoveMultipleInput,
	s3Config: any,
	bucket: string,
	cancellationToken: CancellationToken,
	results: any,
): Promise<void> {
	const maxConcurrency = input.options?.maxConcurrency || 5;

	const inFlight = new Set<Promise<any>>();
	let batchIndex = 0;

	while (batchIndex < batches.length || inFlight.size > 0) {
		// CHECK: Before queuing new batches
		if (cancellationToken.isCancelled()) {
			// Wait for in-flight batches to complete
			if (inFlight.size > 0) {
				await Promise.allSettled(Array.from(inFlight));
			}

			// Mark remaining batches as cancelled
			markRemainingBatchesAsCancelled(batches, batchIndex, results);
		}

		// Queue new batches up to maxConcurrency
		while (inFlight.size < maxConcurrency && batchIndex < batches.length) {
			// Double-check cancellation before starting new batch
			if (cancellationToken.isCancelled()) {
				break;
			}

			const currentIndex = batchIndex;
			const batch = batches[currentIndex];
			batchIndex++;

			const batchPromise = processBatchWithRetry(
				batch,
				currentIndex + 1,
				input,
				s3Config,
				bucket,
				cancellationToken,
			)
				.then(result => {
					// Update results
					results.deleted.push(...result.successful);
					results.failed.push(...result.failed);
					results.batchesProcessed++;
					if (result.hasErrors) {
						results.batchesFailed++;
					}

					// Call progress callback (only if not cancelled)
					if (input.options?.onProgress && !cancellationToken.isCancelled()) {
						input.options.onProgress(
							buildProgressInfo(
								currentIndex + 1,
								batches.length,
								results,
								result,
							),
						);
					}

					return result;
				})
				.finally(() => {
					inFlight.delete(batchPromise);
				});

			inFlight.add(batchPromise);
		}

		// Wait for at least one batch to complete
		if (inFlight.size > 0) {
			await Promise.race(Array.from(inFlight));
		}
	}
}

async function processBatchWithRetry(
	batch: { key: string; versionId?: string }[],
	batchNumber: number,
	input: RemoveMultipleInput,
	s3Config: any,
	bucket: string,
	cancellationToken: CancellationToken,
): Promise<BatchResult> {
	const maxAttempts = input.options?.retry?.maxAttempts || 3;
	const retryDelay = input.options?.retry?.delayMs || 1000;

	let keysToRetry = batch;
	let allSuccessful: {
		key: string;
		versionId?: string;
		deletedAt: Date;
	}[] = [];

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		// CHECK: Before each retry attempt
		if (cancellationToken.isCancelled()) {
			// Return current state, mark remaining as cancelled
			return {
				batchNumber,
				successful: allSuccessful,
				failed: keysToRetry.map(k => ({
					key: k.key,
					versionId: k.versionId,
					error: {
						code: 'CANCELLED',
						message: 'Operation was cancelled',
					},
				})),
				hasErrors: true,
				retryAttempts: attempt - 1,
			};
		}

		try {
			const result = await deleteObjectsBatch(
				keysToRetry,
				s3Config,
				bucket,
				input.options?.expectedBucketOwner,
			);

			const { successful, failed } = parseS3Response(result);
			allSuccessful = [...allSuccessful, ...successful];

			if (failed.length === 0) {
				return {
					batchNumber,
					successful: allSuccessful,
					failed: [],
					hasErrors: false,
					retryAttempts: attempt,
				};
			}

			// Partial failure - retry only failed keys if not at max attempts
			if (attempt < maxAttempts) {
				// @ts-expect-error failed type
				keysToRetry = failed.map(f => ({ key: f.key, versionId: f.versionId }));

				// Use cancellable sleep for retry delay
				const cancelled = await sleepWithCancellation(
					retryDelay,
					cancellationToken,
				);
				if (cancelled) {
					return {
						batchNumber,
						successful: allSuccessful,
						failed: keysToRetry.map(k => ({
							key: k.key,
							versionId: k.versionId,
							error: {
								code: 'CANCELLED',
								message: 'Operation was cancelled during retry',
							},
						})),
						hasErrors: true,
						retryAttempts: attempt,
					};
				}
				continue;
			}

			// Max attempts reached
			return {
				batchNumber,
				successful: allSuccessful,
				failed,
				hasErrors: true,
				retryAttempts: attempt,
			};
		} catch (error) {
			if (attempt < maxAttempts && !cancellationToken.isCancelled()) {
				await sleepWithCancellation(retryDelay, cancellationToken);
				continue;
			}

			return {
				batchNumber,
				successful: allSuccessful,
				failed: keysToRetry.map(k => ({
					key: k.key,
					versionId: k.versionId,
					error: {
						code: 'ERROR',
						message: error instanceof Error ? error.message : 'Unknown error',
					},
				})),
				hasErrors: true,
				retryAttempts: attempt,
			};
		}
	}

	throw new Error('Unexpected end of retry loop');
}

/**
 * Sleep with cancellation support
 * Returns true if cancelled during sleep, false if completed normally
 */
async function sleepWithCancellation(
	ms: number,
	cancellationToken: CancellationToken,
): Promise<boolean> {
	const startTime = Date.now();
	const checkInterval = 100; // Check every 100ms

	while (Date.now() - startTime < ms) {
		if (cancellationToken.isCancelled()) {
			return true; // Cancelled
		}
		await sleep(Math.min(checkInterval, ms - (Date.now() - startTime)));
	}

	return false; // Completed normally
}

async function deleteObjectsBatch(
	keys: { key: string; versionId?: string }[],
	s3Config: any,
	bucket: string,
	expectedBucketOwner?: string,
) {
	const objects = keys
		.map(
			k =>
				`<Object><Key>${k.key}</Key>${k.versionId ? `<VersionId>${k.versionId}</VersionId>` : ''}</Object>`,
		)
		.join('');

	const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<Delete xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
	<Quiet>false</Quiet>
	${objects}
</Delete>`;

	const contentMd5 = await calculateContentMd5(xmlBody);

	const deleteObjectsInput = {
		Bucket: bucket,
		Delete: {
			Objects: keys.map(k => ({
				Key: k.key,
				...(k.versionId && { VersionId: k.versionId }),
			})),
			Quiet: false,
		},
		ExpectedBucketOwner: expectedBucketOwner,
		ContentMD5: contentMd5,
	};

	return deleteObjects(
		{
			...s3Config,
			userAgentValue: getStorageUserAgentValue(StorageAction.Remove),
		},
		deleteObjectsInput,
	);
}

function parseS3Response(response: any) {
	const successful = (response.Deleted || []).map((item: any) => ({
		key: item.Key,
		versionId: item.VersionId,
		deletedAt: new Date(),
	}));

	const failed = (response.Errors || []).map((item: any) => ({
		key: item.Key,
		versionId: item.VersionId,
		error: {
			code: item.Code,
			message: item.Message,
		},
	}));

	return { successful, failed };
}

/**
 * Mark remaining batches as cancelled
 */
function markRemainingBatchesAsCancelled(
	batches: { key: string; versionId?: string }[][],
	startIndex: number,
	results: any,
): void {
	for (let i = startIndex; i < batches.length; i++) {
		const cancelledKeys = batches[i].map(key => ({
			key: key.key,
			versionId: key.versionId,
			batchNumber: i + 1,
		}));
		results.cancelled.push(...cancelledKeys);
	}
}

/**
 * Build final output with all results
 */
function buildOutput(
	results: any,
	totalRequested: number,
	wasCancelled: boolean,
): RemoveMultipleOutput {
	const output: RemoveMultipleOutput = {
		summary: {
			totalRequested,
			successCount: results.deleted.length,
			failureCount: results.failed.length,
			cancelledCount: results.cancelled.length,
			batchesProcessed: results.batchesProcessed,
			batchesFailed: results.batchesFailed,
			wasCancelled,
		},
		deleted: results.deleted,
		failed: results.failed.map((f: any) => ({
			key: f.key,
			versionId: f.versionId,
			error: {
				code: f.error.code,
				message: f.error.message,
				batchNumber: f.batchNumber || 1,
				retryAttempts: f.retryAttempts || 0,
			},
		})),
	};

	// Only include cancelled array if there are cancelled keys
	if (results.cancelled.length > 0) {
		output.cancelled = results.cancelled;
	}

	return output;
}

function buildProgressInfo(
	batchNumber: number,
	totalBatches: number,
	results: any,
	currentBatch: BatchResult,
): any {
	return {
		batchNumber,
		processedCount: results.deleted.length + results.failed.length,
		totalCount:
			results.deleted.length + results.failed.length + results.cancelled.length,
		successCount: results.deleted.length,
		failureCount: results.failed.length,
		currentBatch: {
			successful: currentBatch.successful.map(s => ({
				key: s.key,
				versionId: s.versionId,
			})),
			failed: currentBatch.failed.map(f => ({
				key: f.key,
				versionId: f.versionId,
				error: f.error.message,
			})),
		},
	};
}

/**
 * Simple sleep utility
 */
function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}
