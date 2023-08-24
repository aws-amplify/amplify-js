// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isCancelError } from '../../../AwsClients/S3/runtime';
import {
	DownloadTask,
	TransferTaskState,
	UploadTask,
} from '../../../types/common';

type CreateCancellableTaskOptions<Result> = {
	job: () => Promise<Result>;
	onCancel: (abortErrorOverwrite?: Error) => void;
};

type CancellableTask<Result> = DownloadTask<Result>;

const createCancellableTask = <Result>({
	job,
	onCancel,
}: CreateCancellableTaskOptions<Result>): CancellableTask<Result> => {
	const state = TransferTaskState.IN_PROGRESS;
	let abortErrorOverwriteRecord: Error | undefined = undefined;
	const downloadTask = {
		cancel: (abortErrorOverwrite?: Error) => {
			abortErrorOverwriteRecord = abortErrorOverwrite;
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
			if (isCancelError(e)) {
				downloadTask.state = TransferTaskState.CANCELED;
				throw abortErrorOverwriteRecord ?? e;
			}
			downloadTask.state = TransferTaskState.ERROR;
			throw e;
		}
	})();

	return Object.assign(downloadTask, {
		result: wrappedJobPromise,
	});
};

export const createDownloadTask = createCancellableTask;

type CreateUploadTaskOptions<Result> = {
	job: () => Promise<Result>;
	onCancel: (abortErrorOverwrite?: Error) => void;
	onResume?: () => void;
	onPause?: () => void;
	isMultipartUpload?: boolean;
};

export const createUploadTask = <Result>({
	job,
	onCancel,
	onResume,
	onPause,
	isMultipartUpload,
}: CreateUploadTaskOptions<Result>): UploadTask<Result> => {
	const cancellableTask = createCancellableTask<Result>({
		job,
		onCancel,
	});

	const uploadTask = {
		...cancellableTask,
		pause: () => {
			const { state } = uploadTask;
			if (!isMultipartUpload || state !== TransferTaskState.IN_PROGRESS) {
				return;
			}
			uploadTask.state = TransferTaskState.PAUSED;
			onPause?.();
		},
		resume: () => {
			const { state } = uploadTask;
			if (!isMultipartUpload || state !== TransferTaskState.PAUSED) {
				return;
			}
			uploadTask.state = TransferTaskState.IN_PROGRESS;
			onResume?.();
		},
	};
	return uploadTask;
};
