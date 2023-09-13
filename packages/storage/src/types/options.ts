// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageAccessLevel } from '@aws-amplify/core';

export type StorageWriteOptions = {
	accessLevel?: StorageAccessLevel;
	targetIdentityId: never;
};

export type StorageReadOptions =
	| { accessLevel?: 'guest' | 'private' }
	| { accessLevel: 'protected'; targetIdentityId?: string };

export type StorageListAllOptions = StorageReadOptions & {
	listAll: true;
};

export type StorageListPaginateOptions = StorageReadOptions & {
	listAll?: false;
	pageSize?: number;
	nextToken?: string;
};

export type StorageRemoveOptions = StorageWriteOptions;

export type StorageCopySourceOptions = StorageReadOptions & {
	key: string;
};

export type StorageCopyDestinationOptions = StorageWriteOptions & {
	key: string;
};
