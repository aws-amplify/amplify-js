/* eslint-disable no-console */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { removeMultiple } from '../src/providers/s3';

/**
 * Example usage of the removeMultiple API with cancellation support
 */
async function exampleUsage() {
	try {
		// Basic usage - delete multiple files with cancellation support
		const basicOperation = removeMultiple({
			keys: [
				{ key: 'documents/file1.pdf' },
				{ key: 'images/photo1.jpg' },
				{ key: 'videos/video1.mp4' },
			],
		});

		// Cancel after 2 seconds if needed
		setTimeout(() => {
			basicOperation.cancel();
			console.log('Basic operation cancelled');
		}, 2000);

		const basicResult = await basicOperation.result;
		console.log(
			`Basic deletion: ${basicResult.summary.successCount} succeeded, ${basicResult.summary.failureCount} failed, ${basicResult.summary.cancelledCount} cancelled`,
		);

		// Advanced usage with all options and cancellation
		const advancedOperation = removeMultiple({
			keys: [
				{ key: 'temp/file1.txt' },
				{ key: 'temp/file2.txt', versionId: 'version123' },
				{ key: 'temp/file3.txt' },
				// ... up to 5000 files
			],
			options: {
				batchSize: 500, // Process 500 files per batch
				batchStrategy: 'parallel', // Process batches in parallel
				maxConcurrency: 3, // Max 3 concurrent batches
				errorHandling: 'continue', // Continue even if some batches fail
				delayBetweenBatchesMs: 100, // 100ms delay between sequential batches
				retry: {
					maxAttempts: 3, // Retry failed batches up to 3 times
					delayMs: 1000, // 1 second delay between retries
				},
				onProgress: progress => {
					console.log(
						`Progress: ${progress.processedCount}/${progress.totalCount} processed`,
					);
					console.log(
						`Batch ${progress.batchNumber}: ${progress.currentBatch.successful.length} succeeded, ${progress.currentBatch.failed.length} failed`,
					);
				},
			},
		});

		// Cancel after 10 seconds
		setTimeout(() => {
			if (!advancedOperation.isCancelled()) {
				advancedOperation.cancel();
				console.log('Advanced operation cancelled');
			}
		}, 10000);

		const advancedResult = await advancedOperation.result;

		console.log('Advanced deletion results:');
		console.log(`Total requested: ${advancedResult.summary.totalRequested}`);
		console.log(`Successfully deleted: ${advancedResult.summary.successCount}`);
		console.log(`Failed to delete: ${advancedResult.summary.failureCount}`);
		console.log(`Cancelled: ${advancedResult.summary.cancelledCount}`);
		console.log(`Was cancelled: ${advancedResult.summary.wasCancelled}`);
		console.log(
			`Batches processed: ${advancedResult.summary.batchesProcessed}`,
		);
		console.log(`Batches failed: ${advancedResult.summary.batchesFailed}`);

		// Handle failures
		if (advancedResult.failed.length > 0) {
			console.log('Failed deletions:');
			advancedResult.failed.forEach(failure => {
				console.log(
					`- ${failure.key}: ${failure.error.message} (batch ${failure.error.batchNumber}, ${failure.error.retryAttempts} attempts)`,
				);
			});
		}

		// Handle cancelled keys
		if (advancedResult.cancelled && advancedResult.cancelled.length > 0) {
			console.log('Cancelled deletions:');
			advancedResult.cancelled.forEach(cancelled => {
				console.log(`- ${cancelled.key} (batch ${cancelled.batchNumber})`);
			});
		}

		// Sequential processing with cancellation during delay
		const sequentialOperation = removeMultiple({
			keys: [
				{ key: 'logs/log1.txt' },
				{ key: 'logs/log2.txt' },
				{ key: 'logs/log3.txt' },
			],
			options: {
				batchStrategy: 'sequential',
				errorHandling: 'failEarly', // Stop on first batch failure
				delayBetweenBatchesMs: 2000, // 2 second delay between batches
			},
		});

		// Cancel during delay period - should stop immediately
		setTimeout(() => {
			sequentialOperation.cancel();
			console.log('Sequential operation cancelled during delay');
		}, 3000);

		const sequentialResult = await sequentialOperation.result;
		console.log(
			`Sequential deletion: ${sequentialResult.summary.successCount} files deleted, ${sequentialResult.summary.cancelledCount} cancelled`,
		);
	} catch (error) {
		console.error('Deletion failed:', error);

		// Handle validation errors
		if (
			error instanceof Error &&
			error.message.includes('Dangerous key detected')
		) {
			console.error(
				'Attempted to delete root folder or use dangerous patterns',
			);
		}
	}
}

// Cancellation examples
async function cancellationExamples() {
	// Example 1: Cancel immediately
	const operation1 = removeMultiple({
		keys: [{ key: 'file1.txt' }, { key: 'file2.txt' }],
	});

	// Cancel before any processing starts
	operation1.cancel();

	const result1 = await operation1.result;
	console.log('Immediate cancellation:', result1.summary.wasCancelled); // true
	console.log('All keys cancelled:', result1.summary.cancelledCount === 2); // true

	// Example 2: Cancel during processing
	const operation2 = removeMultiple({
		keys: Array.from({ length: 5000 }, (_, i) => ({ key: `file${i}.txt` })),
		options: {
			batchSize: 1000,
			batchStrategy: 'sequential',
			delayBetweenBatchesMs: 1000,
			onProgress: progress => {
				console.log(`Processed batch ${progress.batchNumber}`);
			},
		},
	});

	// Cancel after 2.5 seconds (likely during delay between batches)
	setTimeout(() => {
		console.log('Cancelling during processing...');
		operation2.cancel();
	}, 2500);

	const result2 = await operation2.result;
	console.log('Partial processing results:');
	console.log(
		`- Processed: ${result2.summary.successCount + result2.summary.failureCount}`,
	);
	console.log(`- Cancelled: ${result2.summary.cancelledCount}`);
	console.log(`- Was cancelled: ${result2.summary.wasCancelled}`);

	// Example 3: Check cancellation status
	const operation3 = removeMultiple({
		keys: [{ key: 'test.txt' }],
	});

	console.log('Initially cancelled?', operation3.isCancelled()); // false

	operation3.cancel();
	console.log('After cancel() called?', operation3.isCancelled()); // true

	// Idempotent - safe to call multiple times
	operation3.cancel();
	operation3.cancel();
	console.log('After multiple cancel() calls?', operation3.isCancelled()); // still true

	const result3 = await operation3.result;
	// Result still resolves normally, just with cancelled status
	console.log(
		'Result resolved with cancellation:',
		result3.summary.wasCancelled,
	);
}

// Error handling with cancellation
async function errorHandlingWithCancellation() {
	// Example: Cancel during retry attempts
	const operation = removeMultiple({
		keys: [{ key: 'file1.txt' }, { key: 'file2.txt' }],
		options: {
			retry: {
				maxAttempts: 5,
				delayMs: 2000, // 2 second delay between retries
			},
			errorHandling: 'continue',
		},
	});

	// Cancel during retry attempts
	setTimeout(() => {
		console.log('Cancelling during retry attempts...');
		operation.cancel();
	}, 3000);

	const result = await operation.result;

	// Check if any failures were due to cancellation
	const cancelledFailures = result.failed.filter(
		f => f.error.code === 'CANCELLED',
	);
	console.log(`Failures due to cancellation: ${cancelledFailures.length}`);

	// Result always resolves, never rejects, even when cancelled
	console.log(
		'Operation completed with cancellation:',
		result.summary.wasCancelled,
	);
}

// UI Integration example
function uiIntegrationExample() {
	let currentOperation: any = null;

	// Start deletion
	function startDeletion(filesToDelete: { key: string }[]) {
		currentOperation = removeMultiple({
			keys: filesToDelete,
			options: {
				batchStrategy: 'parallel',
				maxConcurrency: 5,
				onProgress: progress => {
					// Update UI progress bar
					const percentage =
						(progress.processedCount / progress.totalCount) * 100;
					updateProgressBar(percentage);

					// Update status text
					updateStatusText(
						`Processed ${progress.processedCount} of ${progress.totalCount} files`,
					);
				},
			},
		});

		// Enable cancel button
		enableCancelButton();

		// Handle completion
		currentOperation.result.then((result: any) => {
			if (result.summary.wasCancelled) {
				showMessage(
					`Operation cancelled. Processed ${result.summary.successCount} files.`,
				);
			} else {
				showMessage(
					`Deletion complete. ${result.summary.successCount} files deleted.`,
				);
			}

			// Disable cancel button
			disableCancelButton();
			currentOperation = null;
		});
	}

	// Cancel current operation
	function cancelDeletion() {
		if (currentOperation && !currentOperation.isCancelled()) {
			currentOperation.cancel();
			showMessage('Cancellation requested...');
		}
	}

	// Mock UI functions
	function updateProgressBar(percentage: number) {
		console.log(`Progress: ${percentage.toFixed(1)}%`);
	}

	function updateStatusText(text: string) {
		console.log(`Status: ${text}`);
	}

	function showMessage(message: string) {
		console.log(`Message: ${message}`);
	}

	function enableCancelButton() {
		console.log('Cancel button enabled');
	}

	function disableCancelButton() {
		console.log('Cancel button disabled');
	}

	return { startDeletion, cancelDeletion };
}

export {
	exampleUsage,
	cancellationExamples,
	errorHandlingWithCancellation,
	uiIntegrationExample,
};
