// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export enum TransferTaskState {
	IN_PROGRESS,
	PAUSED,
	CANCELED,
	SUCCESS,
	ERROR,
}

export type TransferProgressEvent = {
	target?: TransferTask<any>;
	// Transferred data in bytes
	transferred: number;
	// Total data in bytes
	total?: number;
};

export type UploadTask<Result> = PromiseLike<Result> & {
	cancel: (reason?: any) => void;
	pause: () => void;
	resume: () => void;
	state: TransferTaskState;
};

export type DownloadTask<Result> = Omit<UploadTask<Result>, 'pause' | 'resume'>;

export type TransferTask<Result> = DownloadTask<Result> | UploadTask<Result>;
