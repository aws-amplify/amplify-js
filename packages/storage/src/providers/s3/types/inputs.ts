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
} from '../types';

export type CopyInput = StorageCopyInput;

export type GetPropertiesInput =
	StorageGetPropertiesInput<GetPropertiesOptions>;

export type GetUrlInput = StorageGetUrlInput<GetUrlOptions>;

export type ListAllInput = StorageListInput<ListAllOptions>;

export type ListPaginateInput = StorageListInput<ListPaginateOptions>;

export type RemoveInput = StorageRemoveInput<RemoveOptions>;

export type DownloadDataInput = StorageDownloadDataInput<DownloadDataOptions>;

export type UploadDataInput = StorageUploadDataInput<UploadDataOptions>;
