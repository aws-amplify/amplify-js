// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	DownloadDataWithPathOutput,
	CopyWithPathOutput,
	GetPropertiesWithPathOutput,
	GetUrlWithPathOutput,
	ListAllWithPathOutput,
	ListPaginateWithPathOutput,
	RemoveWithPathOutput,
} from '../../providers/s3/types';

import { ListLocationsOutput, LocationCredentials } from './credentials';

/**
 * @internal
 */
export type ListCallerAccessGrantsOutput = ListLocationsOutput;

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
export type DownloadDataOutput = DownloadDataWithPathOutput;

/**
 * @internal
 */
export type ListAllOutput = ListAllWithPathOutput;

/**
 * @internal
 */
export type ListPaginateOutput = ListPaginateWithPathOutput;

/**
 * @internal
 */
export type CopyOutput = CopyWithPathOutput;
