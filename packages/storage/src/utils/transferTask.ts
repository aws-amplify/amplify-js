// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { DownloadTask, TransferTaskState } from '../types/common';

type CreateDownloadTaskOptions<Result> = {
	job: () => Promise<Result>;
	onCancel: (abortErrorOverwrite?: Error) => void;
	abortController?: AbortController;
};

export const createDownloadTask = <Result>({
	job,
	onCancel,
	abortController,
}: CreateDownloadTaskOptions<Result>): DownloadTask<Result> => {
	const state = TransferTaskState.IN_PROGRESS;
	const downloadTask = {
		cancel: (abortErrorOverwrite?: Error) => {
			const { state } = downloadTask;
			if (
				state === TransferTaskState.CANCELED ||
				state === TransferTaskState.ERROR ||
				state === TransferTaskState.SUCCESS
			) {
				return;
			}
			downloadTask.state = TransferTaskState.CANCELED;
			onCancel(abortErrorOverwrite);
		},
		state,
	};

	const wrappedJobPromise = (async () => {
		try {
			const result = await job();
			downloadTask.state = TransferTaskState.SUCCESS;
			return result;
		} catch (e) {
			if (abortController?.signal.aborted) {
				downloadTask.state = TransferTaskState.CANCELED;
				throw abortController.signal.reason ?? e;
			}
			downloadTask.state = TransferTaskState.ERROR;
			throw e;
		}
	})();

	return Object.assign(downloadTask, {
		result: wrappedJobPromise,
	});
};
