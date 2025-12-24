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
	CopyDestinationWithKeyOptions,
	CopySourceWithKeyOptions,
	DownloadDataWithKeyOptions,
	DownloadDataWithPathOptions,
	GetPropertiesWithKeyOptions,
	GetPropertiesWithPathOptions,
	GetUrlWithKeyOptions,
	GetUrlWithPathOptions,
	ListAllWithPathOptions,
	ListAllWithPrefixOptions,
	ListPaginateWithPathOptions,
	ListPaginateWithPrefixOptions,
	RemoveOptions,
	UploadDataWithKeyOptions,
	UploadDataWithPathOptions,
} from '../types';

// TODO: support use accelerate endpoint option
/**
 * @deprecated Use {@link CopyWithPathInput} instead.
 * Input type for S3 copy API.
 */
export type CopyInput = StorageCopyInputWithKey<
	CopySourceWithKeyOptions,
	CopyDestinationWithKeyOptions
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
	StorageGetPropertiesInputWithKey<GetPropertiesWithKeyOptions>;
/**
 * Input type with for S3 getProperties API.
 */
export type GetPropertiesWithPathInput =
	StorageGetPropertiesInputWithPath<GetPropertiesWithPathOptions>;

/**
 * @deprecated Use {@link GetUrlWithPathInput} instead.
 * Input type for S3 getUrl API.
 */
export type GetUrlInput = StorageGetUrlInputWithKey<GetUrlWithKeyOptions>;
/**
 * Input type with path for S3 getUrl API.
 */
export type GetUrlWithPathInput =
	StorageGetUrlInputWithPath<GetUrlWithPathOptions>;

/**
 * Input type with path for S3 list API. Lists all bucket objects.
 */
export type ListAllWithPathInput =
	StorageListInputWithPath<ListAllWithPathOptions>;

/**
 * Input type with path for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateWithPathInput =
	StorageListInputWithPath<ListPaginateWithPathOptions>;

/**
 * @deprecated Use {@link ListAllWithPathInput} instead.
 * Input type for S3 list API. Lists all bucket objects.
 */
export type ListAllInput = StorageListInputWithPrefix<ListAllWithPrefixOptions>;

/**
 * @deprecated Use {@link ListPaginateWithPathInput} instead.
 * Input type for S3 list API. Lists bucket objects with pagination.
 */
export type ListPaginateInput =
	StorageListInputWithPrefix<ListPaginateWithPrefixOptions>;

/**
 * @deprecated Use {@link RemoveWithPathInput} instead.
 * Input type with key for S3 remove API.
 */
export type RemoveInput = StorageRemoveInputWithKey<RemoveOptions>;

/**
 * Input type with path for S3 remove API.
 */
export type RemoveWithPathInput = StorageRemoveInputWithPath<
	Omit<RemoveOptions, 'accessLevel'> & FolderDeletionOptions
>;

/**
 * Folder deletion options for remove API
 */
export interface FolderDeletionOptions {
	recursive?: boolean;
	batchSize?: number;
	errorHandling?: 'throw' | 'continue';
	listingStrategy?: 'list-all-first' | 'stream';
	confirmLargeDeletion?: boolean;
	expectedFileCount?: number;
	onProgress?(progress: FolderDeletionProgress): void;
}

/**
 * Input type with path for S3 remove API.
 */
export interface RemoveWithPathInput2 {
	path: string;
	options?: {
		useAccelerateEndpoint?: boolean;
		expectedBucketOwner?: string;

		// New options for folder deletion
		/** Number of files to process per batch. Default: 1000 (S3 maximum). */
		batchSize?: number;

		/** Error handling strategy. 'failEarly' stops on first error, 'continue' processes all batches regardless of errors. Default: 'failEarly'. */
		errorHandling?: 'failEarly' | 'continue';

		/** Callback function invoked after each batch completes, providing progress updates with file counts and error details. */
		onProgress?(progress: ProgressInfo): void;
	};
}

/**
 * Progress information for folder deletion
 */
export interface FolderDeletionProgress {
	totalFiles: number;
	deletedCount: number;
	failedCount: number;
	currentBatch: number;
	totalBatches: number;
}

/**
 * Input type for S3 removeObjects API to delete multiple objects.
 */
export interface RemoveObjectsInput {
	paths: string[];
	options?: {
		expectedBucketOwner?: string;
	};
}

/**
 * Input type for S3 removeMultiple API to delete multiple objects with advanced options.
 */
export interface RemoveMultipleInput {
	keys: {
		key: string;
		versionId?: string;
	}[];
	options?: {
		batchSize?: number;
		batchStrategy?: 'sequential' | 'parallel';
		delayBetweenBatchesMs?: number;
		maxConcurrency?: number;
		errorHandling?: 'throw' | 'failEarly' | 'continue';
		retry?: {
			maxAttempts?: number;
			delayMs?: number;
		};
		onProgress?(progress: ProgressInfo): void;
		expectedBucketOwner?: string;
	};
}

/**
 * Progress information for removeMultiple API.
 */
export interface ProgressInfo {
	deleted?: { path: string }[];
	failed?: {
		path: string;
		code: string;
		message: string;
	}[];
}

/**
 * @deprecated Use {@link DownloadDataWithPathInput} instead.
 * Input type for S3 downloadData API.
 */
export type DownloadDataInput =
	StorageDownloadDataInputWithKey<DownloadDataWithKeyOptions>;

/**
 * Input type with path for S3 downloadData API.
 */
export type DownloadDataWithPathInput =
	StorageDownloadDataInputWithPath<DownloadDataWithPathOptions>;

/**
 * @deprecated Use {@link UploadDataWithPathInput} instead.
 * Input type for S3 uploadData API.
 */
export type UploadDataInput =
	StorageUploadDataInputWithKey<UploadDataWithKeyOptions>;

/**
 * Input type with path for S3 uploadData API.
 */
export type UploadDataWithPathInput =
	StorageUploadDataInputWithPath<UploadDataWithPathOptions>;
