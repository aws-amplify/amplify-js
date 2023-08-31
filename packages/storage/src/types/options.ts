// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageAccessLevel } from '@aws-amplify/core';

export type StorageOptions =
	| { accessLevel?: 'guest' | 'private' }
	| {
			accessLevel: 'protected';
			targetIdentityId?: string;
	  };

/**
 * The data payload type for upload operation.
 */
export type UploadSource = Blob | BufferSource | string | File;

export type StorageListAllOptions = StorageOptions & {
	listAll: true;
};

export type StorageListPaginateOptions = StorageOptions & {
	listAll?: false;
	pageSize?: number;
	nextToken?: string;
};

export type StorageRemoveOptions = StorageOptions;

export type StorageCopySource = {
	key: string;
} & StorageOptions;

export type StorageCopyDestination = {
	key: string;
	accessLevel?: StorageAccessLevel;
};
