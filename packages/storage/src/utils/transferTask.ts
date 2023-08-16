// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { TransferTask, TransferTaskState } from '../types/common';

type CreateTransferTaskOptions<Result> = {
	job: () => Promise<Result>;
	onCancel: (abortErrorOverwrite?: Error) => void;
	onPause: () => void;
	onResume: () => void;
	abortController?: AbortController;
};

export const createTransferTask = <Result>({
	job,
	onCancel,
	abortController,
	onPause,
	onResume,
}: CreateTransferTaskOptions<Result>): TransferTask<Result> => {
	const state = TransferTaskState.IN_PROGRESS;
	const transferTask = {
		cancel: (abortErrorOverwrite?: Error) => {
			const { state } = transferTask;
			if (
				state === TransferTaskState.CANCELED ||
				state === TransferTaskState.ERROR ||
				state === TransferTaskState.SUCCESS
			) {
				return;
			}
			onCancel(abortErrorOverwrite);
			transferTask.state = TransferTaskState.CANCELED;
		},
		pause: () => {
			const { state } = transferTask;
			if (state !== TransferTaskState.IN_PROGRESS) {
				return;
			}
			onPause();
			transferTask.state = TransferTaskState.PAUSED;
		},
		resume: () => {
			const { state } = transferTask;
			if (state !== TransferTaskState.PAUSED) {
				return;
			}
			onResume();
			transferTask.state = TransferTaskState.IN_PROGRESS;
		},
		state,
	};

	const wrappedJobPromise = (async () => {
		try {
			const result = await job();
			transferTask.state = TransferTaskState.SUCCESS;
			return result;
		} catch (e) {
			if (abortController?.signal.aborted) {
				transferTask.state = TransferTaskState.CANCELED;
				throw abortController.signal.reason ?? e;
			}
			transferTask.state = TransferTaskState.ERROR;
			throw e;
		}
	})();

	return Object.assign(transferTask, {
		result: wrappedJobPromise,
	}) as TransferTask<Result>;
};
