// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isCancelError } from '../../../errors/CanceledError';
import {
	DownloadTask,
	TransferTaskState,
	UploadTask,
} from '../../../types/common';
import { logger } from '../../../utils';

type CreateCancellableTaskOptions<Result> = {
	job: () => Promise<Result>;
	onCancel: (message?: string) => void;
};

type CancellableTask<Result> = DownloadTask<Result>;

const createCancellableTask = <Result>({
	job,
	onCancel,
}: CreateCancellableTaskOptions<Result>): CancellableTask<Result> => {
	const state = 'IN_PROGRESS' as TransferTaskState;
	let canceledErrorMessage: string | undefined = undefined;
	const cancelableTask = {
		cancel: (message?: string) => {
			const { state } = cancelableTask;
			if (state === 'CANCELED' || state === 'ERROR' || state === 'SUCCESS') {
				logger.debug(`This task cannot be canceled. State: ${state}`);
				return;
			}
			cancelableTask.state = 'CANCELED';
			canceledErrorMessage = message;
			onCancel(canceledErrorMessage);
		},
		state,
	};

	const wrappedJobPromise = (async () => {
		try {
			const result = await job();
			cancelableTask.state = 'SUCCESS';
			return result;
		} catch (e) {
			if (isCancelError(e)) {
				cancelableTask.state = 'CANCELED';
				e.message = canceledErrorMessage ?? e.message;
			}
			cancelableTask.state = 'ERROR';
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
	onCancel: (message?: string) => void;
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
			if (!isMultipartUpload || state !== 'IN_PROGRESS') {
				logger.debug(`This task cannot be paused. State: ${state}`);
				return;
			}
			// @ts-ignore
			uploadTask.state = 'PAUSED';
			onPause?.();
		},
		resume: () => {
			const { state } = uploadTask;
			if (!isMultipartUpload || state !== 'PAUSED') {
				logger.debug(`This task cannot be resumed. State: ${state}`);
				return;
			}
			// @ts-ignore
			uploadTask.state = 'IN_PROGRESS';
			onResume?.();
		},
	});

	return uploadTask;
};
