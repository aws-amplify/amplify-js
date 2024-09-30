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
 * @deprecated Use {@link CopyWithPathInput} instead.
 * Input type for S3 copy API.
 */
export type CopyInput = StorageCopyInputWithKey<
	CopySourceOptionsWithKey,
	CopyDestinationOptionsWithKey
>;
/**
 * Input type with path for S3 copy API.
 */
export type CopyWithPathInput = StorageCopyInputWithPath;

/**
 * @deprecated Use {@link GetPropertiesWithPathInput} instead.
 * Input type for S3 getProperties API.
 */
export type GetPropertiesInput =
	StorageGetPropertiesInputWithKey<GetPropertiesOptionsWithKey>;
/**
 * Input type with for S3 getProperties API.
 */
export type GetPropertiesWithPathInput =
	StorageGetPropertiesInputWithPath<GetPropertiesOptionsWithPath>;

/**
 * @deprecated Use {@link GetUrlWithPathInput} instead.
 * Input type for S3 getUrl API.
 */
export type GetUrlInput = StorageGetUrlInputWithKey<GetUrlOptionsWithKey>;
/**
 * Input type with path for S3 getUrl API.
 */
export type GetUrlWithPathInput =
	StorageGetUrlInputWithPath<GetUrlOptionsWithPath>;

/**
 * Input type with path for S3 list API. Lists all bucket objects.
 */
export type ListAllWithPathInput =
	StorageListInputWithPath<ListAllOptionsWithPath>;

/**
 * Input type with path for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateWithPathInput =
	StorageListInputWithPath<ListPaginateOptionsWithPath>;

/**
 * @deprecated Use {@link ListAllWithPathInput} instead.
 * Input type for S3 list API. Lists all bucket objects.
 */
export type ListAllInput = StorageListInputWithPrefix<ListAllOptionsWithPrefix>;

/**
 * @deprecated Use {@link ListPaginateWithPathInput} instead.
 * Input type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateInput =
	StorageListInputWithPrefix<ListPaginateOptionsWithPrefix>;

/**
 * @deprecated Use {@link RemoveWithPathInput} instead.
 * Input type with key for S3 remove API.
 */
export type RemoveInput = StorageRemoveInputWithKey<RemoveOptions>;

/**
 * Input type with path for S3 remove API.
 */
export type RemoveWithPathInput = StorageRemoveInputWithPath<
	Omit<RemoveOptions, 'accessLevel'>
>;

/**
 * @deprecated Use {@link DownloadDataWithPathInput} instead.
 * Input type for S3 downloadData API.
 */
export type DownloadDataInput =
	StorageDownloadDataInputWithKey<DownloadDataOptionsWithKey>;

/**
 * Input type with path for S3 downloadData API.
 */
export type DownloadDataWithPathInput =
	StorageDownloadDataInputWithPath<DownloadDataOptionsWithPath>;

/**
 * @deprecated Use {@link UploadDataWithPathInput} instead.
 * Input type for S3 uploadData API.
 */
export type UploadDataInput =
	StorageUploadDataInputWithKey<UploadDataOptionsWithKey>;

/**
 * Input type with path for S3 uploadData API.
 */
export type UploadDataWithPathInput =
	StorageUploadDataInputWithPath<UploadDataOptionsWithPath>;
