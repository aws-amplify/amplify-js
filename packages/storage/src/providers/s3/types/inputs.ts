// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageCopyInputWithKey,
	StorageCopyInputWithPath,
	StorageDownloadDataInputWithKey,
	StorageDownloadDataInputWithPath,
	StorageGetPropertiesInputWithKey,
	StorageGetPropertiesInputWithPath,
	StorageGetUrlInputWithKey,
	StorageGetUrlInputWithPath,
	StorageListInputWithPath,
	StorageListInputWithPrefix,
	StorageRemoveInputWithKey,
	StorageRemoveInputWithPath,
	StorageUploadDataInputWithKey,
	StorageUploadDataInputWithPath,
} from '../../../types';
import {
	CopyDestinationOptionsWithKey,
	CopySourceOptionsWithKey,
	DownloadDataOptionsWithKey,
	DownloadDataOptionsWithPath,
	GetPropertiesOptionsWithKey,
	GetPropertiesOptionsWithPath,
	GetUrlOptionsWithKey,
	GetUrlOptionsWithPath,
	ListAllOptionsWithPath,
	ListAllOptionsWithPrefix,
	ListPaginateOptionsWithPath,
	ListPaginateOptionsWithPrefix,
	RemoveOptions,
	UploadDataOptionsWithKey,
	UploadDataOptionsWithPath,
} from '../types';

// TODO: support use accelerate endpoint option
/**
 * Input type for S3 copy API.
 */

/** @deprecated Use {@link CopyInputWithPath} instead. */
export type CopyInput = StorageCopyInputWithKey<
	CopySourceOptionsWithKey,
	CopyDestinationOptionsWithKey
>;
export type CopyInputWithPath = StorageCopyInputWithPath;

/**
 * Input type for S3 getProperties API.
 */
/** @deprecated Use {@link GetPropertiesInputWithPath} instead. */
export type GetPropertiesInput =
	StorageGetPropertiesInputWithKey<GetPropertiesOptionsWithKey>;
export type GetPropertiesInputWithPath =
	StorageGetPropertiesInputWithPath<GetPropertiesOptionsWithPath>;

/**
 * Input type for S3 getUrl API.
 */
/** @deprecated Use {@link GetUrlInputWithPath} instead. */
export type GetUrlInput = StorageGetUrlInputWithKey<GetUrlOptionsWithKey>;
export type GetUrlInputWithPath =
	StorageGetUrlInputWithPath<GetUrlOptionsWithPath>;

/**
 * Input type for S3 list API. Lists all bucket objects.
 */
export type ListAllInputWithPath =
	StorageListInputWithPath<ListAllOptionsWithPath>;

/**
 * Input type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateInputWithPath =
	StorageListInputWithPath<ListPaginateOptionsWithPath>;

/**
 * @deprecated Use {@link ListAllInputWithPath} instead.
 * Input type for S3 list API. Lists all bucket objects.
 */
export type ListAllInput = StorageListInputWithPrefix<ListAllOptionsWithPrefix>;

/**
 * @deprecated Use {@link ListPaginateInputWithPath} instead.
 * Input type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateInput =
	StorageListInputWithPrefix<ListPaginateOptionsWithPrefix>;

/**
 * @deprecated Use {@link RemoveInputWithPath} instead.
 * Input type with key for S3 remove API.
 */
export type RemoveInput = StorageRemoveInputWithKey<RemoveOptions>;

/**
 * Input type with path for S3 remove API.
 */
export type RemoveInputWithPath = StorageRemoveInputWithPath<
	Omit<RemoveOptions, 'accessLevel'>
>;

/**
 * Input type for S3 downloadData API.
 */
/** @deprecated Use {@link DownloadDataInputWithPath} instead. */
export type DownloadDataInput =
	StorageDownloadDataInputWithKey<DownloadDataOptionsWithKey>;
export type DownloadDataInputWithPath =
	StorageDownloadDataInputWithPath<DownloadDataOptionsWithPath>;

/**
 * Input type for S3 uploadData API.
 */
/** @deprecated Use {@link UploadDataInputWithPath} instead. */
export type UploadDataInput =
	StorageUploadDataInputWithKey<UploadDataOptionsWithKey>;
export type UploadDataInputWithPath =
	StorageUploadDataInputWithPath<UploadDataOptionsWithPath>;
