// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { resolveCtxArgs } from '@aws-amplify/core/internals/utils';

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

/**
 * GET HTTP request
 * @param {GetInput} input - Input for GET operation
 * @returns {GetOperation} Operation for GET request
 * @throws - {@link RestApiError}
 * @example
 * Send a GET request
 * ```js
 * import { get, isCancelError } from '@aws-amplify/api';
 *
 * const { body } = await get({
 *   apiName,
 *   path,
 *   options: {
 *     headers, // Optional, A map of custom header key/values
 *     body, // Optional, JSON object or FormData
 *     queryParams, // Optional, A map of query strings
 *   }
 * }).response;
 * const data = await body.json();
 * ```
 * @example
 * Cancel a GET request
 *
 * ```js
 * import { get, isCancelError } from '@aws-amplify/api';
 *
 * const { response, cancel } = get({apiName, path, options});
 * cancel(message);
 * try {
 *   await response;
 * } catch (e) {
 *   if (isCancelError(e)) {
 *    // handle request cancellation
 *   }
 *   //...
 * }
 * ```
 */
export function get(input: GetInput): GetOperation;
export function get(ctx: AmplifyContext, input: GetInput): GetOperation;
export function get(...args: any[]): GetOperation {
	const [ctx, input] = resolveCtxArgs<GetInput>(args);

	return commonGet(ctx, input);
}

/**
 * POST HTTP request
 * @param {PostInput} input - Input for POST operation
 * @returns {PostOperation} Operation for POST request
 * @throws - {@link RestApiError}
 * @example
 * Send a POST request
 * ```js
 * import { post, isCancelError } from '@aws-amplify/api';
 *
 * const { body } = await post({
 *   apiName,
 *   path,
 *   options: {
 *     headers, // Optional, A map of custom header key/values
 *     body, // Optional, JSON object or FormData
 *     queryParams, // Optional, A map of query strings
 *   }
 * }).response;
 * const data = await body.json();
 * ```
 * @example
 * Cancel a POST request
 *
 * ```js
 * import { post, isCancelError } from '@aws-amplify/api';
 *
 * const { response, cancel } = post({apiName, path, options});
 * cancel(message);
 * try {
 *   await response;
 * } catch (e) {
 *   if (isCancelError(e)) {
 *    // handle request cancellation
 *   }
 *   //...
 * }
 * ```
 */
export function post(input: PostInput): PostOperation;
export function post(ctx: AmplifyContext, input: PostInput): PostOperation;
export function post(...args: any[]): PostOperation {
	const [ctx, input] = resolveCtxArgs<PostInput>(args);

	return commonPost(ctx, input);
}

/**
 * PUT HTTP request
 * @param {PutInput} input - Input for PUT operation
 * @returns {PutOperation} Operation for PUT request
 * @throws - {@link RestApiError}
 * @example
 * Send a PUT request
 * ```js
 * import { put, isCancelError } from '@aws-amplify/api';
 *
 * const { body } = await put({
 *   apiName,
 *   path,
 *   options: {
 *     headers, // Optional, A map of custom header key/values
 *     body, // Optional, JSON object or FormData
 *     queryParams, // Optional, A map of query strings
 *   }
 * }).response;
 * const data = await body.json();
 * ```
 * @example
 * Cancel a PUT request
 * ```js
 * import { put, isCancelError } from '@aws-amplify/api';
 *
 * const { response, cancel } = put({apiName, path, options});
 * cancel(message);
 * try {
 *  await response;
 * } catch (e) {
 *   if (isCancelError(e)) {
 *     // handle request cancellation
 *   }
 * //...
 * }
 * ```
 */
export function put(input: PutInput): PutOperation;
export function put(ctx: AmplifyContext, input: PutInput): PutOperation;
export function put(...args: any[]): PutOperation {
	const [ctx, input] = resolveCtxArgs<PutInput>(args);

	return commonPut(ctx, input);
}

/**
 * DELETE HTTP request
 * @param {DeleteInput} input - Input for DELETE operation
 * @returns {DeleteOperation} Operation for DELETE request
 * @throws - {@link RestApiError}
 * @example
 * Send a DELETE request
 * ```js
 * import { del } from '@aws-amplify/api';
 *
 * const { statusCode } = await del({
 *   apiName,
 *   path,
 *   options: {
 *     headers, // Optional, A map of custom header key/values
 *     queryParams, // Optional, A map of query strings
 *   }
 * }).response;
 * ```
 */
export function del(input: DeleteInput): DeleteOperation;
export function del(ctx: AmplifyContext, input: DeleteInput): DeleteOperation;
export function del(...args: any[]): DeleteOperation {
	const [ctx, input] = resolveCtxArgs<DeleteInput>(args);

	return commonDel(ctx, input);
}

/**
 * HEAD HTTP request
 * @param {HeadInput} input - Input for HEAD operation
 * @returns {HeadOperation} Operation for HEAD request
 * @throws - {@link RestApiError}
 * @example
 * Send a HEAD request
 * ```js
 * import { head, isCancelError } from '@aws-amplify/api';
 *
 * const { headers, statusCode } = await head({
 *   apiName,
 *   path,
 *   options: {
 *     headers, // Optional, A map of custom header key/values
 *     queryParams, // Optional, A map of query strings
 *   }
 * }),response;
 * ```
 *
 */
export function head(input: HeadInput): HeadOperation;
export function head(ctx: AmplifyContext, input: HeadInput): HeadOperation;
export function head(...args: any[]): HeadOperation {
	const [ctx, input] = resolveCtxArgs<HeadInput>(args);

	return commonHead(ctx, input);
}

/**
 * PATCH HTTP request
 * @param {PatchInput} input - Input for PATCH operation
 * @returns {PatchOperation} Operation for PATCH request
 * @throws - {@link RestApiError}
 * @example
 * Send a PATCH request
 * ```js
 * import { patch } from '@aws-amplify/api';
 *
 * const { body } = await patch({
 *   apiName,
 *   path,
 *   options: {
 *     headers, // Optional, A map of custom header key/values
 *     body, // Optional, JSON object or FormData
 *     queryParams, // Optional, A map of query strings
 *   }
 * }).response;
 * const data = await body.json();
 * ```
 *
 * @example
 * Cancel a PATCH request
 * ```js
 * import { patch, isCancelError } from '@aws-amplify/api';
 *
 * const { response, cancel } = patch({apiName, path, options});
 * cancel(message);
 * try {
 *  await response;
 * } catch (e) {
 *  if (isCancelError(e)) {
 *   // handle request cancellation
 *  }
 * //...
 * }
 * ```
 */
export function patch(input: PatchInput): PatchOperation;
export function patch(ctx: AmplifyContext, input: PatchInput): PatchOperation;
export function patch(...args: any[]): PatchOperation {
	const [ctx, input] = resolveCtxArgs<PatchInput>(args);

	return commonPatch(ctx, input);
}
