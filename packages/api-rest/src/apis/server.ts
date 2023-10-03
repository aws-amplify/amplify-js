// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
import {
	get as commonGet,
	post as commonPost,
	put as commonPut,
	del as commonDel,
	head as commonHead,
	patch as commonPatch,
} from '../common/publicApis';
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
 * GET HTTP request (server-side)
 */
export const get = (
	contextSpec: AmplifyServer.ContextSpec,
	input: GetInput
): GetOperation =>
	commonGet(getAmplifyServerContext(contextSpec).amplify, input);

/**
 * POST HTTP request (server-side)
 */
export const post = (
	contextSpec: AmplifyServer.ContextSpec,
	input: PostInput
): PostOperation =>
	commonPost(getAmplifyServerContext(contextSpec).amplify, input);

/**
 * PUT HTTP request (server-side)
 */
export const put = (
	contextSpec: AmplifyServer.ContextSpec,
	input: PutInput
): PutOperation =>
	commonPut(getAmplifyServerContext(contextSpec).amplify, input);

/**
 * DELETE HTTP request (server-side)
 */
export const del = (
	contextSpec: AmplifyServer.ContextSpec,
	input: DeleteInput
): DeleteOperation =>
	commonDel(getAmplifyServerContext(contextSpec).amplify, input);

/**
 * HEAD HTTP request (server-side)
 */
export const head = (
	contextSpec: AmplifyServer.ContextSpec,
	input: HeadInput
): HeadOperation =>
	commonHead(getAmplifyServerContext(contextSpec).amplify, input);

/**
 * PATCH HTTP request (server-side)
 */
export const patch = (
	contextSpec: AmplifyServer.ContextSpec,
	input: PatchInput
): PatchOperation =>
	commonPatch(getAmplifyServerContext(contextSpec).amplify, input);
