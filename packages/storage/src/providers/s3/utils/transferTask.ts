// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isCancelError } from '../../../errors/CanceledError';
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
	const cancelableTask = {
		cancel: (abortErrorOverwrite?: Error) => {
			abortErrorOverwriteRecord = abortErrorOverwrite;
			const { state } = cancelableTask;
			if (
				state === TransferTaskState.CANCELED ||
				state === TransferTaskState.ERROR ||
				state === TransferTaskState.SUCCESS
			) {
				return;
			}
			cancelableTask.state = TransferTaskState.CANCELED;
			onCancel(abortErrorOverwrite);
		},
		state,
	};

	const wrappedJobPromise = (async () => {
		try {
			const result = await job();
			cancelableTask.state = TransferTaskState.SUCCESS;
			return result;
		} catch (e) {
			if (isCancelError(e)) {
				cancelableTask.state = TransferTaskState.CANCELED;
				throw abortErrorOverwriteRecord ?? e;
			}
			cancelableTask.state = TransferTaskState.ERROR;
			throw e;
		}
	})();

	return Object.assign(cancelableTask, {
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

	const uploadTask = Object.assign(cancellableTask, {
		pause: () => {
			const { state } = uploadTask;
			if (!isMultipartUpload || state !== TransferTaskState.IN_PROGRESS) {
				return;
			}
			// @ts-ignore
			uploadTask.state = TransferTaskState.PAUSED;
			onPause?.();
		},
		resume: () => {
			const { state } = uploadTask;
			if (!isMultipartUpload || state !== TransferTaskState.PAUSED) {
				return;
			}
			// @ts-ignore
			uploadTask.state = TransferTaskState.IN_PROGRESS;
			onResume?.();
		},
	});

	return uploadTask;
};
