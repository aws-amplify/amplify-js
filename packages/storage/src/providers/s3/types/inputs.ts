// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StrictUnion } from '@aws-amplify/core/internals/utils';

import {
	StorageCopyInput,
	StorageDownloadDataInputKey,
	StorageDownloadDataInputPath,
	StorageGetPropertiesInputKey,
	StorageGetPropertiesInputPath,
	StorageGetUrlInputKey,
	StorageGetUrlInputPath,
	StorageListInput,
	StorageRemoveInput,
	StorageUploadDataInput,
} from '../../../types';
import {
	CopyDestinationOptions,
	CopySourceOptions,
	DownloadDataOptionsKey,
	DownloadDataOptionsPath,
	GetPropertiesOptionsKey,
	GetPropertiesOptionsPath,
	GetUrlOptionsKey,
	GetUrlOptionsPath,
	ListAllOptions,
	ListPaginateOptions,
	RemoveOptions,
	UploadDataOptions,
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

/** @deprecated Use {@link GetPropertiesInputPath} instead. */
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
