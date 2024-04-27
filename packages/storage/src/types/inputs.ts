// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StrictUnion } from '@aws-amplify/core/internals/utils';

import {
	StorageListAllOptions,
	StorageListPaginateOptions,
	StorageOptions,
} from './options';

export type StorageOperationInput = StrictUnion<
	StorageOperationInputWithKey | StorageOperationInputWithPath
>;
export type StorageOperationInputWithPrefixPath = StrictUnion<
	StorageOperationInputWithPath | StorageOperationInputWithPrefix
>;
/** @deprecated Use {@link StorageOperationInputWithPath} instead. */
export interface StorageOperationInputWithKey {
	/** @deprecated Use `path` instead. */
	key: string;
}
export interface StorageOperationInputWithPath {
	path: string | (({ identityId }: { identityId?: string }) => string);
}

/** @deprecated Use {@link StorageOperationInputWithPath} instead. */
export interface StorageOperationInputWithPrefix {
	/** @deprecated Use `path` instead. */
	prefix?: string;
}

export interface StorageOperationOptionsInput<Options> {
	options?: Options;
}

/** @deprecated Use {@link StorageDownloadDataInputWithPath} instead. */
export type StorageDownloadDataInputWithKey<Options extends StorageOptions> =
	StorageOperationInputWithKey & StorageOperationOptionsInput<Options>;

export type StorageDownloadDataInputWithPath<Options> =
	StorageOperationInputWithPath & StorageOperationOptionsInput<Options>;

/** @deprecated Use {@link StorageGetPropertiesInputWithPath} instead. */
export type StorageGetPropertiesInputWithKey<Options extends StorageOptions> =
	StorageOperationInputWithKey & StorageOperationOptionsInput<Options>;

export type StorageGetPropertiesInputWithPath<Options> =
	StorageOperationInputWithPath & StorageOperationOptionsInput<Options>;

export type StorageRemoveInputWithKey<Options> = StorageOperationInputWithKey &
	StorageOperationOptionsInput<Options>;

export type StorageRemoveInputWithPath<Options> =
	StorageOperationInputWithPath & StorageOperationOptionsInput<Options>;

/** @deprecated Use {@link StorageListInputWithPath} instead. */
export type StorageListInputWithPrefix<
	Options extends StorageListAllOptions | StorageListPaginateOptions,
> = StorageOperationInputWithPrefix & StorageOperationOptionsInput<Options>;

export type StorageListInputWithPath<
	Options extends StorageListAllOptions | StorageListPaginateOptions,
> = StorageOperationInputWithPath & StorageOperationOptionsInput<Options>;

/** @deprecated Use {@link StorageGetUrlInputWithPath} instead. */
export type StorageGetUrlInputWithKey<Options extends StorageOptions> =
	StorageOperationInputWithKey & StorageOperationOptionsInput<Options>;

export type StorageGetUrlInputWithPath<Options> =
	StorageOperationInputWithPath & StorageOperationOptionsInput<Options>;

/** @deprecated Use {@link StorageUploadDataInputWithPath} instead. */
export type StorageUploadDataInputWithKey<Options extends StorageOptions> =
	StorageOperationInputWithKey &
		StorageOperationOptionsInput<Options> &
		StorageUploadDataInputPayload;

export type StorageUploadDataInputWithPath<Options> =
	StorageOperationInputWithPath &
		StorageOperationOptionsInput<Options> &
		StorageUploadDataInputPayload;

/** @deprecated Use {@link StorageCopyInputWithPath} instead. */
export interface StorageCopyInputWithKey<
	SourceOptions extends StorageOptions,
	DestinationOptions extends StorageOptions,
> {
	source: SourceOptions;
	destination: DestinationOptions;
}

export interface StorageCopyInputWithPath {
	source: StorageOperationInputWithPath;
	destination: StorageOperationInputWithPath;
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
