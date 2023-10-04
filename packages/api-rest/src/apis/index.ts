// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	get as commonGet,
	post as commonPost,
	put as commonPut,
	del as commonDel,
	head as commonHead,
	patch as commonPatch,
} from './common/publicApis';
import {
	DeleteInput,
	DeleteOperation,
	GetInput,
	GetOperation,
	HeadInput,
	HeadOperation,
	PatchInput,
	PatchOperation,
	PostInput,
	PostOperation,
	PutInput,
	PutOperation,
} from '../types';

/**
 * GET HTTP request
 */
export const get = (input: GetInput): GetOperation => commonGet(Amplify, input);

/**
 * POST HTTP request
 */
export const post = (input: PostInput): PostOperation =>
	commonPost(Amplify, input);

/**
 * PUT HTTP request
 */
export const put = (input: PutInput): PutOperation => commonPut(Amplify, input);

/**
 * DELETE HTTP request
 */
export const del = (input: DeleteInput): DeleteOperation =>
	commonDel(Amplify, input);

/**
 * HEAD HTTP request
 */
export const head = (input: HeadInput): HeadOperation =>
	commonHead(Amplify, input);

/**
 * PATCH HTTP request
 */
export const patch = (input: PatchInput): PatchOperation =>
	commonPatch(Amplify, input);
