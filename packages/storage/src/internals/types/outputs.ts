// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	CopyWithPathOutput,
	DownloadDataWithPathOutput,
	GetPropertiesWithPathOutput,
	GetUrlWithPathOutput,
	ListAllWithPathOutput,
	ListPaginateWithPathOutput,
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
export type ListOutput = ListAllWithPathOutput | ListPaginateWithPathOutput;

/**
 * @internal
 */
export type UploadDataOutput = UploadDataWithPathOutput;

/**
 * @internal
 */
export type ListCallerAccessGrantsOutput = ListLocationsOutput;
