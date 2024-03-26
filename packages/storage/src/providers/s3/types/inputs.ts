// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StrictUnion } from '@aws-amplify/core/internals/utils';

import {
	StorageCopyInputKey,
	StorageCopyInputPath,
	StorageDownloadDataInputKey,
	StorageDownloadDataInputPath,
	StorageGetPropertiesInputKey,
	StorageGetPropertiesInputPath,
	StorageGetUrlInputKey,
	StorageGetUrlInputPath,
	StorageListInput,
	StorageRemoveInputKey,
	StorageRemoveInputPath,
	StorageUploadDataInputKey,
	StorageUploadDataInputPath,
} from '../../../types';
import {
	CopyDestinationOptionsKey,
	CopySourceOptionsKey,
	DownloadDataOptionsKey,
	DownloadDataOptionsPath,
	GetPropertiesOptionsKey,
	GetPropertiesOptionsPath,
	GetUrlOptionsKey,
	GetUrlOptionsPath,
	ListAllOptions,
	ListPaginateOptions,
	RemoveOptions,
	UploadDataOptionsKey,
	UploadDataOptionsPath,
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
export type GetUrlInput = StrictUnion<GetUrlInputKey | GetUrlInputPath>;

/** @deprecated Use {@link GetUrlInputPath} instead. */
export type GetUrlInputKey = StorageGetUrlInputKey<GetUrlOptionsKey>;
export type GetUrlInputPath = StorageGetUrlInputPath<GetUrlOptionsPath>;

/**
 * Input type for S3 list API. Lists all bucket objects.
 */
export type ListAllInput = StorageListInput<ListAllOptions>;

/**
 * Input type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateInput = StorageListInput<ListPaginateOptions>;

/**
 * @deprecated Use {@link RemoveInputPath} instead.
 * Input type with key for S3 remove API.
 */
export type RemoveInputKey = StorageRemoveInputKey<RemoveOptions>;

/**
 * Input type with path for S3 remove API.
 */
export type RemoveInputPath = StorageRemoveInputPath<
	Omit<RemoveOptions, 'accessLevel'>
>;

/**
 * Input type for S3 remove API.
 */
export type RemoveInput = StrictUnion<RemoveInputKey | RemoveInputPath>;

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
