// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageCopyInput,
	StorageGetPropertiesInput,
	StorageGetUrlInput,
	StorageListInput,
	StorageRemoveInput,
	StorageDownloadDataInput,
	StorageUploadDataInput,
} from '../../../types';
import {
	GetPropertiesOptions,
	GetUrlOptions,
	ListAllOptions,
	ListPaginateOptions,
	RemoveOptions,
	DownloadDataOptions,
	UploadDataOptions,
	CopyDestinationOptions,
	CopySourceOptions,
} from '../types';

// TODO: support use accelerate endpoint option
/**
 * Input type for S3 copy API.
 */
export type CopyInput = StorageCopyInput<
	CopySourceOptions,
	CopyDestinationOptions
>;

/**
 * Input type for S3 getProperties API.
 */
export type GetPropertiesInput =
	StorageGetPropertiesInput<GetPropertiesOptions>;

/**
 * Input type for S3 getUrl API.
 */
export type GetUrlInput = StorageGetUrlInput<GetUrlOptions>;

/**
 * Input type for S3 list API. Lists all bucket objects.
 */
export type ListAllInput = StorageListInput<ListAllOptions>;

/**
 * Input type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateInput = StorageListInput<ListPaginateOptions>;

/**
 * Input type for S3 remove API.
 */
export type RemoveInput = StorageRemoveInput<RemoveOptions>;

/**
 * Input type for S3 downloadData API.
 */
export type DownloadDataInput = StorageDownloadDataInput<DownloadDataOptions>;

/**
 * Input type for S3 uploadData API.
 */
export type UploadDataInput = StorageUploadDataInput<UploadDataOptions>;
