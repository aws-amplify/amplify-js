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

import { Equal, Expect } from './utils';

interface Input {
	targetIdentityId?: string;
	prefix?: string;
	path: string;
	subpathStrategy?: StorageSubpathStrategy;
	nextToken: string;
	pageSize: number;
	useAccelerateEndpoint: boolean;
	accessLevel: StorageAccessLevel;
	listAll: boolean;
}

interface Output {
	listOutputItems: ListOutputItem[];
	listOutputItemsWithPath: ListOutputItemWithPath[];
	excludedSubpaths: string[];
	nextToken: string;
}

describe('List API input types', () => {
	test('should compile', () => {
		function handleTest({
			targetIdentityId,
			prefix,
			path,
			subpathStrategy,
			nextToken,
			pageSize,
			useAccelerateEndpoint,
			accessLevel,
		}: Input) {
			const listPaginateInput: ListPaginateInput = {
				prefix,
				options: {
					accessLevel: 'protected',
					targetIdentityId,
					// @ts-expect-error subpathStrategy is not part of this input
					subpathStrategy,
				},
			};

			const listAllInput: ListAllInput = {
				prefix,
				options: {
					listAll: true,
					accessLevel: 'protected',
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
					// @ts-expect-error pageSize is not part of this input
					pageSize,
				},
			};

			type Tests = [
				Expect<Equal<typeof listPaginateInput, ListPaginateInput>>,
				Expect<Equal<typeof listAllInput, ListAllInput>>,
				Expect<
					Equal<typeof listPaginateWithPathInput, ListPaginateWithPathInput>
				>,
				Expect<Equal<typeof listAllWithPathInput, ListAllWithPathInput>>,
			];
			type Result = Expect<Equal<Tests, [true, true, true, true]>>;
		}
	});
});

describe('List API ouput types', () => {
	test('should compile', () => {
		function handleTest({
			listOutputItems,
			nextToken,
			excludedSubpaths,
			listOutputItemsWithPath,
		}: Output) {
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

			type Tests = [
				Expect<Equal<typeof listPaginateOutput, ListPaginateOutput>>,
				Expect<Equal<typeof listAllOutput, ListAllOutput>>,
				Expect<
					Equal<typeof listPaginateWithPathOutput, ListPaginateWithPathOutput>
				>,
				Expect<Equal<typeof listAllWithPathOutput, ListAllWithPathOutput>>,
			];

			type Result = Expect<Equal<Tests, [true, true, true, true]>>;
		}
	});
});
