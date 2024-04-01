// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StrictUnion } from '@aws-amplify/core/internals/utils';

import {
	StorageCopyInputWithKey,
	StorageCopyInputWithPath,
	StorageDownloadDataInputKey,
	StorageDownloadDataInputPath,
	StorageGetPropertiesInputKey,
	StorageGetPropertiesInputPath,
	StorageGetUrlInputWithKey,
	StorageGetUrlInputWithPath,
	StorageListInputPath,
	StorageListInputPrefix,
	StorageRemoveInputWithKey,
	StorageRemoveInputWithPath,
	StorageUploadDataInputKey,
	StorageUploadDataInputPath,
} from '../../../types';
import {
	CopyDestinationOptionsWithKey,
	CopySourceOptionsWithKey,
	DownloadDataOptionsKey,
	DownloadDataOptionsPath,
	GetPropertiesOptionsKey,
	GetPropertiesOptionsPath,
	GetUrlOptionsWithKey,
	GetUrlOptionsWithPath,
	ListAllOptionsPath,
	ListAllOptionsPrefix,
	ListPaginateOptionsPath,
	ListPaginateOptionsPrefix,
	RemoveOptions,
	UploadDataOptionsKey,
	UploadDataOptionsPath,
} from '../types';

// TODO: support use accelerate endpoint option
/**
 * Input type for S3 copy API.
 */
export type CopyInput = CopyInputWithKey | CopyInputWithPath;

/** @deprecated Use {@link CopyInputWithPath} instead. */
export type CopyInputWithKey = StorageCopyInputWithKey<
	CopySourceOptionsWithKey,
	CopyDestinationOptionsWithKey
>;
export type CopyInputWithPath = StorageCopyInputWithPath;

/**
 * Input type for S3 getProperties API.
 */
export type GetPropertiesInput = StrictUnion<
	GetPropertiesInputKey | GetPropertiesInputPath
>;

/** @deprecated Use {@link GetPropertiesInputPath} instead. */
export type GetPropertiesInputKey =
	StorageGetPropertiesInputKey<GetPropertiesOptionsKey>;
export type GetPropertiesInputPath =
	StorageGetPropertiesInputPath<GetPropertiesOptionsPath>;

/**
 * Input type for S3 getUrl API.
 */
export type GetUrlInput = StrictUnion<GetUrlInputWithKey | GetUrlInputWithPath>;

/** @deprecated Use {@link GetUrlInputWithPath} instead. */
export type GetUrlInputWithKey =
	StorageGetUrlInputWithKey<GetUrlOptionsWithKey>;
export type GetUrlInputWithPath =
	StorageGetUrlInputWithPath<GetUrlOptionsWithPath>;

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
 * @deprecated Use {@link RemoveInputWithPath} instead.
 * Input type with key for S3 remove API.
 */
export type RemoveInputWithKey = StorageRemoveInputWithKey<RemoveOptions>;

/**
 * Input type with path for S3 remove API.
 */
export type RemoveInputWithPath = StorageRemoveInputWithPath<
	Omit<RemoveOptions, 'accessLevel'>
>;

/**
 * Input type for S3 remove API.
 */
export type RemoveInput = StrictUnion<RemoveInputWithKey | RemoveInputWithPath>;

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
export type UploadDataInput = StrictUnion<
	UploadDataInputKey | UploadDataInputPath
>;

/** @deprecated Use {@link UploadDataInputPath} instead. */
export type UploadDataInputKey =
	StorageUploadDataInputKey<UploadDataOptionsKey>;
export type UploadDataInputPath =
	StorageUploadDataInputPath<UploadDataOptionsPath>;
