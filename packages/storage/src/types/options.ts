// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageAccessLevel } from '@aws-amplify/core';

export interface StorageOptions {
	/** @deprecated This may be removed in the next major version. */
	accessLevel?: StorageAccessLevel;
}

export type StorageListAllOptions = StorageOptions & {
	listAll: true;
	subpathStrategy?: StorageSubpathStrategy;
};

export type StorageListPaginateOptions = StorageOptions & {
	listAll?: false;
	pageSize?: number;
	nextToken?: string;
	subpathStrategy?: StorageSubpathStrategy;
};

export type StorageRemoveOptions = StorageOptions;

export type StorageSubpathStrategy =
	| {
			/**
			 * Default behavior. Includes all subpaths for a given page in the result.
			 */
			strategy: 'include';
	  }
	| {
			/**
			 * When passed, the output of the list API will provide a list of `excludedSubpaths`
			 * that are delimited by the `/` (by default) character.
			 *
			 *
			 * @example
			 * ```ts
			 *	const { excludedSubpaths } = await list({
			 *		path: 'photos/',
			 *		options: {
			 *			subpathStrategy: {
			 *				strategy: 'exclude',
			 *			}
			 *		}
			 *	});
			 *
			 *	console.log(excludedSubpaths);
			 *
			 * ```
			 */
			strategy: 'exclude';
			/**
			 * Deliminate with with a custom delimiter character.
			 *
			 * @example
			 * ```ts
			 *	const { excludedSubpaths } = await list({
			 *		path: 'photos/',
			 *		options: {
			 *			subpathStrategy: {
			 *				strategy: 'exclude',
			 *				delimiter: '-'
			 *			}
			 *		}
			 *	});
			 *
			 *	console.log(excludedSubpaths);
			 *
			 * ```
			 */
			delimiter?: string;
	  };
