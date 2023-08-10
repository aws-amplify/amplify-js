// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type StorageOptions =
	| { accessLevel?: 'guest' | 'private' }
	| {
			accessLevel: 'protected';
			targetIdentityId: string;
	  };

export type StorageOperationParameter<Options extends StorageOptions> = {
	key: string;
	options?: Options;
};

export type StorageListRequest<Options extends StorageOptions> = {
	path?: string;
	options?: Options;
};

// TODO do we need intersection type with 'StorageOptions' here ?
// 'StorageListRequest' already includes 'StorageOptions'
export type StorageListOptions = StorageOptions & {
	pageSize?: number;
	nextToken?: string;
	listAll?: boolean;
};

export type StorageDownloadDataParameter<Options extends StorageOptions> =
	StorageOperationParameter<Options>;

export type StorageDownloadFileParameter<Options extends StorageOptions> =
	StorageOperationParameter<Options> & {
		/**
		 * If supplied full file path in browsers(e.g. path/to/foo.bar)
		 * the directory will be stripped. However, full directory could be
		 * supported in RN.
		 */
		localFile: string;
	};

// TODO: open question whether we should treat uploadFile differently from uploadData
export type StorageUploadDataParameter<Options extends StorageOptions> =
	StorageOperationParameter<Options> & {
		data: Blob | BufferSource | FormData | URLSearchParams | string;
	};

// TODO: open question whether we should treat uploadFile differently from uploadData
export type StorageUploadFileParameter<Options extends StorageOptions> =
	StorageOperationParameter<Options> & {
		data: File;
	};
