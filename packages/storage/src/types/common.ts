// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Headers } from '@aws-amplify/core/internals/aws-client-utils';

export type StorageOperationParameter<Options> = {
	key: string;
	options?: Options;
};

export type StorageDownloadFileParameter = {
	localFile: FileDownloadOptions;
};

export type StorageAccessLevel =
	| 'guest' // Changed for v6; 'public' in v5
	| 'protected'
	| 'private';

export enum TransferTaskState {
	INIT,
	IN_PROGRESS,
	PAUSED,
	CANCELLED,
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

export type TransferEventsMap = {
	progress: TransferProgressEvent;
};

// Native EventTarget class is not available in RN & Edge runtime
export type TransferEventTarget = {
	addEventListener: (
		type: keyof TransferEventsMap,
		listener: (event: TransferEventsMap[keyof TransferEventsMap]) => void
	) => void;
	removeEventListener: (
		type: keyof TransferEventsMap,
		listener: (event: TransferEventsMap[keyof TransferEventsMap]) => void
	) => void;
	onprogress: (event: TransferProgressEvent) => void;
};

export type UploadTask<Result> = TransferEventTarget &
	PromiseLike<Result> & {
		cancel: (reason?: any) => void;
		pause: () => void;
		resume: () => void;
		state: TransferTaskState;
	};

export type DownloadTask<Result> = Omit<UploadTask<Result>, 'pause' | 'resume'>;

export type TransferTask<Result> = DownloadTask<Result> | UploadTask<Result>;

// TODO: replace with ResponsePayloadMixin from core
type Payload = Pick<Body, 'blob' | 'json' | 'text'>;

export type StorageDownloadDataResult = {
	body: Payload;
};

type FileNameToSave = string;

export type FileDownloadOptions =
	| FileNameToSave
	| {
			name: FileNameToSave;
			contentType?: string;
	  };

export type StorageUrl = {
	url: URL;
	headers: Headers;
};
