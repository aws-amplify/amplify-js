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
export type StorageOperationInputWithPrefixPath = StrictUnion<
	StorageOperationInputPath | StorageOperationInputPrefix
>;
/** @deprecated Use {@link StorageOperationInputPath} instead. */
export interface StorageOperationInputKey {
	/** @deprecated Use `path` instead. */
	key: string;
}
export interface StorageOperationInputPath {
	path: string | (({ identityId }: { identityId?: string }) => string);
}

/** @deprecated Use {@link StorageOperationInputPath} instead. */
export interface StorageOperationInputPrefix {
	/** @deprecated Use `path` instead. */
	prefix?: string;
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

/** @deprecated Use {@link StorageGetPropertiesInputPath} instead. */
export type StorageGetPropertiesInputKey<Options extends StorageOptions> =
	StorageOperationInputKey & StorageOperationInput<Options>;

export type StorageGetPropertiesInputPath<Options> = StorageOperationInputPath &
	StorageOperationOptionsInput<Options>;

export type StorageRemoveInputKey<Options> = StorageOperationInputKey &
	StorageOperationOptionsInput<Options>;

export type StorageRemoveInputPath<Options> = StorageOperationInputPath &
	StorageOperationOptionsInput<Options>;

/** @deprecated Use {@link StorageListInputPath} instead. */
export type StorageListInputPrefix<
	Options extends StorageListAllOptions | StorageListPaginateOptions,
> = StorageOperationInputPrefix & StorageOperationOptionsInput<Options>;

export type StorageListInputPath<
	Options extends StorageListAllOptions | StorageListPaginateOptions,
> = StorageOperationInputPath & StorageOperationOptionsInput<Options>;

/** @deprecated Use {@link StorageGetUrlInputPath} instead. */
export type StorageGetUrlInputKey<Options extends StorageOptions> =
	StorageOperationInputKey & StorageOperationInput<Options>;

export type StorageGetUrlInputPath<Options> = StorageOperationInputPath &
	StorageOperationOptionsInput<Options>;

/** @deprecated Use {@link StorageUploadDataInputPath} instead. */
export type StorageUploadDataInputKey<Options extends StorageOptions> =
	StorageOperationInputKey &
		StorageOperationOptionsInput<Options> &
		StorageUploadDataInputPayload;

export type StorageUploadDataInputPath<Options> = StorageOperationInputPath &
	StorageOperationOptionsInput<Options> &
	StorageUploadDataInputPayload;

/** @deprecated Use {@link StorageCopyInputWithPath} instead. */
export interface StorageCopyInputWithKey<
	SourceOptions extends StorageOptions,
	DestinationOptions extends StorageOptions,
> {
	source: SourceOptions & {
		path?: never;
	};
	destination: DestinationOptions & {
		path?: never;
	};
}

export interface StorageCopyInputWithPath {
	source: StorageOperationInputPath & {
		/** @deprecated Use path instead. */
		key?: never;
	};
	destination: StorageOperationInputPath & {
		/** @deprecated Use path instead. */
		key?: never;
	};
}

/**
 * The data payload type for upload operation.
 */
export type StorageUploadDataPayload =
	| Blob
	| ArrayBufferView
	| ArrayBuffer
	| string;

export interface StorageUploadDataInputPayload {
	data: StorageUploadDataPayload;
}
