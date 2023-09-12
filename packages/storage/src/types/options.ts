// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageAccessLevel } from '@aws-amplify/core';

export type StorageOptions =
	| { accessLevel?: 'guest' | 'private' }
	| {
			accessLevel: 'protected';
			targetIdentityId?: string;
	  };

export type StorageListAllOptions = StorageOptions & {
	listAll: true;
};

export type StorageListPaginateOptions = StorageOptions & {
	listAll?: false;
	pageSize?: number;
	nextToken?: string;
};

export type StorageRemoveOptions = Omit<StorageOptions, 'targetIdentityId'>;

export type StorageCopySourceOptions = {
	key: string;
} & StorageOptions;

export type StorageCopyDestinationOptions = {
	key: string;
	accessLevel?: StorageAccessLevel;
};
