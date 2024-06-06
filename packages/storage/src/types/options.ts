// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageAccessLevel } from '@aws-amplify/core';

import { ListDepth } from './common';

export interface StorageOptions {
	/** @deprecated This may be removed in the next major version. */
	accessLevel?: StorageAccessLevel;
}

export type StorageListAllOptions = StorageOptions & {
	listAll: true;
	maximumDepth?: ListDepth;
};

export type StorageListPaginateOptions = StorageOptions & {
	listAll?: false;
	pageSize?: number;
	nextToken?: string;
	maximumDepth?: ListDepth;
};

export type StorageRemoveOptions = StorageOptions;
