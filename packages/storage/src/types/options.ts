// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageDownloadFileParameter,
	StorageOperationParameter,
} from './common';

export type StorageAccessLevelOptions = { level?: 'guest' | 'private' } & {
	level?: 'protected';
	identityId?: string;
};

export interface StorageDownloadOptions extends StorageAccessLevelOptions {
	// Whether to head object to make sure the object existence before downloading; Default false
	validateObjectExistence?: boolean;
	// Whether to use accelerate endpoint. Default false
	useAccelerateEndpoint?: boolean;
}

export type StorageDownloadDataParameter =
	StorageOperationParameter<StorageDownloadOptions>;

export type StorageDownloadFileParams =
	StorageOperationParameter<StorageDownloadOptions> &
		StorageDownloadFileParameter;
