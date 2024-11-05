// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createAssertionFunction } from '../../errors';
import { AmplifyErrorMap, AssertionFunction } from '../../types';

export enum CacheErrorCode {
	NoCacheItem = 'NoCacheItem',
	NullNextNode = 'NullNextNode',
	NullPreviousNode = 'NullPreviousNode',
}

const cacheErrorMap: AmplifyErrorMap<CacheErrorCode> = {
	[CacheErrorCode.NoCacheItem]: {
		message: 'Item not found in the cache storage.',
	},
	[CacheErrorCode.NullNextNode]: {
		message: 'Next node is null.',
	},
	[CacheErrorCode.NullPreviousNode]: {
		message: 'Previous node is null.',
	},
};

export const assert: AssertionFunction<CacheErrorCode> =
	createAssertionFunction(cacheErrorMap);
