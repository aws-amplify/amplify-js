// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable unused-imports/no-unused-vars */
import { StorageAccessLevel } from '@aws-amplify/core';

import {
	ListAllInput,
	ListAllOutput,
	ListAllWithPathInput,
	ListAllWithPathOutput,
	ListOutputItem,
	ListOutputItemWithPath,
	ListPaginateInput,
	ListPaginateOutput,
	ListPaginateWithPathInput,
	ListPaginateWithPathOutput,
} from '../../../../src/providers/s3/types';
import { StorageSubpathStrategy } from '../../../../src/types';

import { Expect } from './utils';

declare const targetIdentityId: undefined | string;
declare const accessLevel: StorageAccessLevel;
declare const prefix: string;
declare const path: string;
declare const subpathStrategy: StorageSubpathStrategy;
declare const nextToken: string;
declare const pageSize: number;
declare const useAccelerateEndpoint: boolean;
declare const listOutputItems: ListOutputItem[];
declare const listOutputItemsWithPath: ListOutputItemWithPath[];
declare const excludedSubpaths: string[];

describe('List API input types', () => {
	const listPaginateInput: ListPaginateInput = {
		prefix,
		options: {
			accessLevel,
			targetIdentityId,
			// @ts-expect-error subpathStrategy is not part of this input
			subpathStrategy,
		},
	};

	const listAllInput: ListAllInput = {
		prefix,
		options: {
			listAll: true,
			accessLevel,
			targetIdentityId,
			// @ts-expect-error subpathStrategy is not part of this input
			subpathStrategy,
		},
	};

	const listPaginateWithPathInput: ListPaginateWithPathInput = {
		path,
		options: {
			subpathStrategy,
			useAccelerateEndpoint,
			pageSize,
			nextToken,
		},
	};

	const listAllWithPathInput: ListAllWithPathInput = {
		path,
		options: {
			listAll: true,
			subpathStrategy,
			useAccelerateEndpoint,
			// @ts-expect-error subpathStrategy is not part of this input
			pageSize,
		},
	};

	type tests = [
		Expect<typeof listPaginateInput, ListPaginateInput>,
		Expect<typeof listAllInput, ListAllInput>,
		Expect<typeof listPaginateWithPathInput, ListPaginateWithPathInput>,
		Expect<typeof listAllWithPathInput, ListAllWithPathInput>,
	];
});

describe('List API ou types', () => {
	const listPaginateOutput: ListPaginateOutput = {
		items: listOutputItems,
		nextToken,
		// @ts-expect-error excludeSubpaths is not part of this output
		excludedSubpaths,
	};

	const listAllOutput: ListAllOutput = {
		items: listOutputItems,
		// @ts-expect-error excludeSubpaths is not part of this output
		excludedSubpaths,
	};

	const listPaginateWithPathOutput: ListPaginateWithPathOutput = {
		items: listOutputItemsWithPath,
		nextToken,
		excludedSubpaths,
	};

	const listAllWithPathOutput: ListAllWithPathOutput = {
		items: listOutputItemsWithPath,
		excludedSubpaths,
	};

	type tests = [
		Expect<typeof listPaginateOutput, ListPaginateOutput>,
		Expect<typeof listAllOutput, ListAllOutput>,
		Expect<typeof listPaginateWithPathOutput, ListPaginateWithPathOutput>,
		Expect<typeof listAllWithPathOutput, ListAllWithPathOutput>,
	];
});
