// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageAccessLevel } from '@aws-amplify/core';

export interface StorageOptions {
	/** @deprecated This may be removed in the next major version. */
	accessLevel?: StorageAccessLevel;
}

export type StorageListAllOptions = StorageOptions & {
	listAll: true;
};

export type StorageListPaginateOptions = StorageOptions & {
	listAll?: false;
	pageSize?: number;
	nextToken?: string;
};

export type StorageRemoveOptions = StorageOptions;
