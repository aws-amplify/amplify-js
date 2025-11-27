// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	CopyWithPathOutput,
	DownloadDataWithPathOutput,
	GetPropertiesWithPathOutput,
	GetUrlWithPathOutput,
	ListAllWithPathOutput,
	ListPaginateWithPathOutput,
	RemoveObjectsOutput as RemoveObjectsWithPathOutput,
	RemoveWithPathOutput,
	UploadDataWithPathOutput,
} from '../../providers/s3/types';

import { ListLocationsOutput, LocationCredentials } from './credentials';

/**
 * @internal
 */
export type CopyOutput = CopyWithPathOutput;

/**
 * @internal
 */
export type DownloadDataOutput = DownloadDataWithPathOutput;

/**
 * @internal
 */
export type GetDataAccessOutput = LocationCredentials;

/**
 * @internal
 */
export type GetPropertiesOutput = GetPropertiesWithPathOutput;

/**
 * @internal
 */
export type GetUrlOutput = GetUrlWithPathOutput;

/**
 * @internal
 */
export type RemoveOutput = RemoveWithPathOutput;

/**
 * @internal
 */
export type RemoveObjectsOutput = RemoveObjectsWithPathOutput;

/**
 * @internal
 */
export interface RemoveMultipleOutput {
	summary: {
		totalRequested: number;
		successCount: number;
		failureCount: number;
		cancelledCount: number;
		batchesProcessed: number;
		batchesFailed: number;
		wasCancelled: boolean;
	};
	deleted: {
		key: string;
		versionId?: string;
		deletedAt?: Date;
	}[];
	failed: {
		key: string;
		versionId?: string;
		error: {
			code: string;
			message: string;
			batchNumber: number;
			retryAttempts: number;
		};
	}[];
	cancelled?: {
		key: string;
		versionId?: string;
		batchNumber: number;
	}[];
}

/**
 * @internal
 */
export interface RemoveMultipleOperation {
	result: Promise<RemoveMultipleOutput>;
	cancel(): void;
	isCancelled(): boolean;
}

/**
 * @internal
 */
export type ListOutput = ListAllWithPathOutput | ListPaginateWithPathOutput;

/**
 * @internal
 */
export type UploadDataOutput = UploadDataWithPathOutput;

/**
 * @internal
 */
export type ListCallerAccessGrantsOutput = ListLocationsOutput;
