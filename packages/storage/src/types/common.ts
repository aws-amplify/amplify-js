// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type { CanceledError } from '../errors/CanceledError';

export type TransferTaskState =
	| 'IN_PROGRESS'
	| 'PAUSED'
	| 'CANCELED'
	| 'SUCCESS'
	| 'ERROR';

export type TransferProgressEvent = {
	transferredBytes: number;
	totalBytes?: number;
};

export type TransferTask<Result> = {
	/**
	 * Cancel an ongoing transfer(upload/download) task. This will reject the `result` promise with an `AbortError` by
	 * default. You can use `isCancelError` to check if the error is caused by cancellation.
	 *
	 * @param message - Optional error message to overwrite the default `canceled` message thrown when the task is
	 * 	canceled. If provided, the `result` promise will be rejected with a {@link CanceledError} with supplied error
	 *  message instead.
	 */
	cancel: (message?: string) => void;

	/**
	 * Pause an ongoing transfer(upload/download) task. This method does not support the following scenarios:
	 * * Downloading data or file from given key.
	 */
	pause: () => void;

	/**
	 * Resume a paused transfer(upload/download) task. This method does not support the following scenarios:
	 * * Downloading data or file from given key.
	 */
	resume: () => void;

	/**
	 * Current state of the transfer task.
	 */
	readonly state: TransferTaskState;

	/**
	 * Promise that resolves when the transfer task is completed. The promise will be rejected if the task is canceled.
	 */
	result: Promise<Result>;
};

export type DownloadTask<Result> = Omit<
	TransferTask<Result>,
	'pause' | 'resume'
>;

export type UploadTask<Result> = TransferTask<Result>;
