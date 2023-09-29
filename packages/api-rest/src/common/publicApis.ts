// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { transferHandler } from './handler';
import {
	GetOptions,
	GetOperation,
	PostOptions,
	PostOperation,
	PutOptions,
	PutOperation,
	DeleteOptions,
	DeleteOperation,
	HeadOptions,
	HeadOperation,
	PatchOptions,
	PatchOperation,
} from '../types';

export const get = (input: GetOptions): GetOperation => {};

export const post = (input: PostOptions): PostOperation => {};

export const put = (input: PutOptions): PutOperation => {};

export const del = (input: DeleteOptions): DeleteOperation => {};

export const head = (input: HeadOptions): HeadOperation => {};

export const patch = (input: PatchOptions): PatchOperation => {};
