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
import { RestApiError } from '../errors';

/**
 * GET HTTP request (server-side)
 * @param {AmplifyServer.ContextSpec} contextSpec - The context spec used to get the Amplify server context.
 * @param {GetInput} input - Input for GET operation.
 * @throws - {@link RestApiError}
 * @example
 * Send a GET request
 * ```js
 * import { get } from 'aws-amplify/api/server';
 * //...
 * const restApiResponse = await runWithAmplifyServerContext({
 *   nextServerContext: { request, response },
 *   operation: async (contextSpec) => {
 *     try {
 *       const { body } = await get(contextSpec, input).response;
 *       return await body.json();
 *     } catch (error) {
 *       console.log(error);
 *       return false;
 *     }
 *   },
 * });
 * ```
 * @see {@link clientGet}
 */
export const get = (
	contextSpec: AmplifyServer.ContextSpec,
	input: GetInput
): GetOperation =>
	commonGet(getAmplifyServerContext(contextSpec).amplify, input);

/**
 * POST HTTP request (server-side)
 * @param {AmplifyServer.ContextSpec} contextSpec - The context spec used to get the Amplify server context.
 * @param {PostInput} input - Input for POST operation.
 * @throws - {@link RestApiError}
 * @example
 * Send a POST request
 * ```js
 * import { post } from 'aws-amplify/api/server';
 * //...
 * const restApiResponse = await runWithAmplifyServerContext({
 *   nextServerContext: { request, response },
 *   operation: async (contextSpec) => {
 *     try {
 *       const { body } = await post(contextSpec, input).response;
 *       return await body.json();
 *     } catch (error) {
 *       console.log(error);
 *       return false;
 *     }
 *   },
 * });
 * ```
 */
export const post = (
	contextSpec: AmplifyServer.ContextSpec,
	input: PostInput
): PostOperation =>
	commonPost(getAmplifyServerContext(contextSpec).amplify, input);

/**
 * PUT HTTP request (server-side)
 * @param {AmplifyServer.ContextSpec} contextSpec - The context spec used to get the Amplify server context.
 * @param {PutInput} input - Input for PUT operation.
 * @throws - {@link RestApiError}
 * @example
 * Send a PUT request
 * ```js
 * import { put } from 'aws-amplify/api/server';
 * //...
 * const restApiResponse = await runWithAmplifyServerContext({
 *   nextServerContext: { request, response },
 *   operation: async (contextSpec) => {
 *     try {
 *       const { body } = await put(contextSpec, input).response;
 *       return await body.json();
 *     } catch (error) {
 *       console.log(error);
 *       return false;
 *     }
 *   },
 * });
 * ```
 */
export const put = (
	contextSpec: AmplifyServer.ContextSpec,
	input: PutInput
): PutOperation =>
	commonPut(getAmplifyServerContext(contextSpec).amplify, input);

/**
 * DELETE HTTP request (server-side)
 * @param {AmplifyServer.ContextSpec} contextSpec - The context spec used to get the Amplify server context.
 * @param {DeleteInput} input - Input for DELETE operation.
 * @throws - {@link RestApiError}
 * @example
 * Send a DELETE request
 * ```js
 * import { del } from 'aws-amplify/api/server';
 * //...
 * const restApiResponse = await runWithAmplifyServerContext({
 *   nextServerContext: { request, response },
 *   operation: async (contextSpec) => {
 *     try {
 *       const { headers } = await del(contextSpec, input).response;
 *     } catch (error) {
 *       console.log(error);
 *       return false;
 *     }
 *   },
 * });
 * ```
 */
export const del = (
	contextSpec: AmplifyServer.ContextSpec,
	input: DeleteInput
): DeleteOperation =>
	commonDel(getAmplifyServerContext(contextSpec).amplify, input);

/**
 * HEAD HTTP request (server-side)
 * @param {AmplifyServer.ContextSpec} contextSpec - The context spec used to get the Amplify server context.
 * @param {HeadInput} input - Input for HEAD operation.
 * @throws - {@link RestApiError}
 * @example
 * Send a HEAD request
 * ```js
 * import { head } from 'aws-amplify/api/server';
 * //...
 * const restApiResponse = await runWithAmplifyServerContext({
 *   nextServerContext: { request, response },
 *   operation: async (contextSpec) => {
 *     try {
 *       const { headers } = await head(contextSpec, input).response;
 *     } catch (error) {
 *       console.log(error);
 *       return false;
 *     }
 *   },
 * });
 * ```
 */
export const head = (
	contextSpec: AmplifyServer.ContextSpec,
	input: HeadInput
): HeadOperation =>
	commonHead(getAmplifyServerContext(contextSpec).amplify, input);

/**
 * PATCH HTTP request (server-side)
 * @param {AmplifyServer.ContextSpec} contextSpec - The context spec used to get the Amplify server context.
 * @param {PatchInput} input - Input for PATCH operation.
 * @throws - {@link RestApiError}
 * @example
 * Send a PATCH request
 * ```js
 * import { patch } from 'aws-amplify/api/server';
 * //...
 * const restApiResponse = await runWithAmplifyServerContext({
 *   nextServerContext: { request, response },
 *   operation: async (contextSpec) => {
 *     try {
 *       const { body } = await patch(contextSpec, input).response;
 *       return await body.json();
 *     } catch (error) {
 *       console.log(error);
 *       return false;
 *     }
 *   },
 * });
 * ```
 */
export const patch = (
	contextSpec: AmplifyServer.ContextSpec,
	input: PatchInput
): PatchOperation =>
	commonPatch(getAmplifyServerContext(contextSpec).amplify, input);
