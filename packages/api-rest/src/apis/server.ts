// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { ContextSpec } from '@aws-amplify/core/internals/adapter-core';

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

import {
	del as commonDel,
	get as commonGet,
	head as commonHead,
	patch as commonPatch,
	post as commonPost,
	put as commonPut,
} from './common/publicApis';
import { resolveServerContext } from './server/resolveServerContext';

/**
 * GET HTTP request (server-side)
 *
 * Accepts either an {@link AmplifyContext} (new pattern) or a legacy
 * {@link ContextSpec} for backward compatibility.
 *
 * @param ctxOrContextSpec - AmplifyContext or legacy ContextSpec
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
 */
export const get = (
	ctxOrContextSpec: AmplifyContext | ContextSpec,
	input: GetInput,
): GetOperation => commonGet(resolveServerContext(ctxOrContextSpec), input);

/**
 * POST HTTP request (server-side)
 *
 * Accepts either an {@link AmplifyContext} (new pattern) or a legacy
 * {@link ContextSpec} for backward compatibility.
 *
 * @param ctxOrContextSpec - AmplifyContext or legacy ContextSpec
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
	ctxOrContextSpec: AmplifyContext | ContextSpec,
	input: PostInput,
): PostOperation => commonPost(resolveServerContext(ctxOrContextSpec), input);

/**
 * PUT HTTP request (server-side)
 *
 * Accepts either an {@link AmplifyContext} (new pattern) or a legacy
 * {@link ContextSpec} for backward compatibility.
 *
 * @param ctxOrContextSpec - AmplifyContext or legacy ContextSpec
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
	ctxOrContextSpec: AmplifyContext | ContextSpec,
	input: PutInput,
): PutOperation => commonPut(resolveServerContext(ctxOrContextSpec), input);

/**
 * DELETE HTTP request (server-side)
 *
 * Accepts either an {@link AmplifyContext} (new pattern) or a legacy
 * {@link ContextSpec} for backward compatibility.
 *
 * @param ctxOrContextSpec - AmplifyContext or legacy ContextSpec
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
	ctxOrContextSpec: AmplifyContext | ContextSpec,
	input: DeleteInput,
): DeleteOperation => commonDel(resolveServerContext(ctxOrContextSpec), input);

/**
 * HEAD HTTP request (server-side)
 *
 * Accepts either an {@link AmplifyContext} (new pattern) or a legacy
 * {@link ContextSpec} for backward compatibility.
 *
 * @param ctxOrContextSpec - AmplifyContext or legacy ContextSpec
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
	ctxOrContextSpec: AmplifyContext | ContextSpec,
	input: HeadInput,
): HeadOperation => commonHead(resolveServerContext(ctxOrContextSpec), input);

/**
 * PATCH HTTP request (server-side)
 *
 * Accepts either an {@link AmplifyContext} (new pattern) or a legacy
 * {@link ContextSpec} for backward compatibility.
 *
 * @param ctxOrContextSpec - AmplifyContext or legacy ContextSpec
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
	ctxOrContextSpec: AmplifyContext | ContextSpec,
	input: PatchInput,
): PatchOperation => commonPatch(resolveServerContext(ctxOrContextSpec), input);
