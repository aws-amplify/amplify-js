// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StrictUnion } from '@aws-amplify/core/internals/utils';

import {
	StorageCopyInputKey,
	StorageCopyInputPath,
	StorageDownloadDataInputKey,
	StorageDownloadDataInputPath,
	StorageGetPropertiesInput,
	StorageGetUrlInput,
	StorageListInputPath,
	StorageListInputPrefix,
	StorageRemoveInput,
	StorageUploadDataInput,
} from '../../../types';
import {
	CopyDestinationOptionsKey,
	CopySourceOptionsKey,
	DownloadDataOptionsKey,
	DownloadDataOptionsPath,
	GetPropertiesOptions,
	GetUrlOptions,
	ListAllOptionsPath,
	ListAllOptionsPrefix,
	ListPaginateOptionsPath,
	ListPaginateOptionsPrefix,
	RemoveOptions,
	UploadDataOptions,
} from '../types';

// TODO: support use accelerate endpoint option
/**
 * Input type for S3 copy API.
 */
export type CopyInput = CopyInputKey | CopyInputPath;

/** @deprecated Use {@link CopyInputPath} instead. */
export type CopyInputKey = StorageCopyInputKey<
	CopySourceOptionsKey,
	CopyDestinationOptionsKey
>;
export type CopyInputPath = StorageCopyInputPath;

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
export type ListAllInput = StrictUnion<ListAllInputPath | ListAllInputPrefix>;

/**
 * Input type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateInput = StrictUnion<
	ListPaginateInputPath | ListPaginateInputPrefix
>;

/**
 * Input type for S3 list API. Lists all bucket objects.
 */
export type ListAllInputPath = StorageListInputPath<ListAllOptionsPath>;

/**
 * Input type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateInputPath =
	StorageListInputPath<ListPaginateOptionsPath>;

/**
 * @deprecated Use {@link ListAllInputPath} instead.
 * Input type for S3 list API. Lists all bucket objects.
 */
export type ListAllInputPrefix = StorageListInputPrefix<ListAllOptionsPrefix>;

/**
 * @deprecated Use {@link ListPaginateInputPath} instead.
 * Input type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateInputPrefix =
	StorageListInputPrefix<ListPaginateOptionsPrefix>;

/**
 * Input type for S3 remove API.
 */
export type RemoveInput = StorageRemoveInput<RemoveOptions>;

/**
 * Input type for S3 downloadData API.
 */
export type DownloadDataInput = StrictUnion<
	DownloadDataInputKey | DownloadDataInputPath
>;
/** @deprecated Use {@link DownloadDataInputPath} instead. */
export type DownloadDataInputKey =
	StorageDownloadDataInputKey<DownloadDataOptionsKey>;
export type DownloadDataInputPath =
	StorageDownloadDataInputPath<DownloadDataOptionsPath>;

/**
 * Input type for S3 uploadData API.
 */
export type UploadDataInput = StorageUploadDataInput<UploadDataOptions>;
