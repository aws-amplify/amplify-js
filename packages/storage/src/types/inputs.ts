// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StrictUnion } from '@aws-amplify/core/internals/utils';

import {
	StorageListAllOptions,
	StorageListPaginateOptions,
	StorageOptions,
} from './options';

// TODO: rename to StorageOperationInput once the other type with
// the same named is removed
export type StorageOperationInputType = StrictUnion<
	StorageOperationInputKey | StorageOperationInputPath
>;

/** @deprecated Use {@link StorageOperationInputPath} instead. */
export interface StorageOperationInputKey {
	/** @deprecated Use `path` instead. */
	key: string;
}
export interface StorageOperationInputPath {
	path: string | (({ identityId }: { identityId?: string }) => string);
}
export interface StorageOperationOptionsInput<Options> {
	options?: Options;
}

/** @deprecated Use {@link StorageDownloadDataInputPath} instead. */
export type StorageDownloadDataInputKey<Options extends StorageOptions> =
	StorageOperationInputKey & StorageOperationOptionsInput<Options>;

export type StorageDownloadDataInputPath<Options> = StorageOperationInputPath &
	StorageOperationOptionsInput<Options>;

// TODO: This needs to be removed after refactor of all storage APIs
export interface StorageOperationInput<Options extends StorageOptions> {
	key: string;
	options?: Options;
}

export type StorageGetPropertiesInput<Options extends StorageOptions> =
	StorageOperationInput<Options>;

export interface StorageRemoveInput<Options extends StorageOptions> {
	key: string;
	options?: Options;
}

export interface StorageListInput<
	Options extends StorageListAllOptions | StorageListPaginateOptions,
> {
	prefix?: string;
	options?: Options;
}

/** @deprecated Use {@link StorageGetUrlInputPath} instead. */
export type StorageGetUrlInputKey<Options extends StorageOptions> =
	StorageOperationInputKey & StorageOperationInput<Options>;

export type StorageGetUrlInputPath<Options> = StorageOperationInputPath &
	StorageOperationOptionsInput<Options>;

export type StorageUploadDataInput<Options extends StorageOptions> =
	StorageOperationInput<Options> & {
		data: StorageUploadDataPayload;
	};

export interface StorageCopyInput<
	SourceOptions extends StorageOptions,
	DestinationOptions extends StorageOptions,
> {
	source: SourceOptions;
	destination: DestinationOptions;
}

/**
 * The data payload type for upload operation.
 */
export type StorageUploadDataPayload =
	| Blob
	| ArrayBufferView
	| ArrayBuffer
	| string;
