// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { RemoveMultipleInput, RemoveMultipleOperation } from '../types';

import { removeMultiple as removeMultipleInternal } from './internal/removeMultiple';

/**
 * Remove multiple objects from S3 with advanced batching and error handling options.
 *
 * @param input - The RemoveMultipleInput object containing keys to delete and options
 * @returns RemoveMultipleOutput with result promise and cancellation capability
 *
 * @example
 * ```typescript
 * import { removeMultiple } from 'aws-amplify/storage/s3';
 *
 * const operation = removeMultiple({
 *   keys: [
 *     { key: 'file1.txt' },
 *     { key: 'file2.txt', versionId: 'version123' }
 *   ],
 *   options: {
 *     batchSize: 500,
 *     batchStrategy: 'parallel',
 *     errorHandling: 'continue',
 *     onProgress: (progress) => {
 *       console.log(`Processed ${progress.processedCount}/${progress.totalCount}`);
 *     }
 *   }
 * });
 *
 * // Cancel if needed
 * setTimeout(() => operation.cancel(), 5000);
 *
 * const result = await operation.result;
 * console.log(`Successfully deleted: ${result.summary.successCount}`);
 * console.log(`Failed to delete: ${result.summary.failureCount}`);
 * console.log(`Cancelled: ${result.summary.cancelledCount}`);
 * ```
 */
export const removeMultiple = (
	input: RemoveMultipleInput,
): RemoveMultipleOperation => {
	return removeMultipleInternal(Amplify, input);
};
