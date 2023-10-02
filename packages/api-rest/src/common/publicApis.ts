// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import {
	GetInput,
	GetOperation,
	PostInput,
	PostOperation,
	PutInput,
	PutOperation,
	DeleteInput,
	DeleteOperation,
	HeadInput,
	HeadOperation,
	PatchInput,
	PatchOperation,
	ApiInput,
	RestApiOptionsBase,
} from '../types';
import { resolveApiUrl, createCancellableOperation } from '../utils';
import { transferHandler } from './handler';

const publicHandler = (
	amplify: AmplifyClassV6,
	options: ApiInput<RestApiOptionsBase>,
	method: string
) => {
	const { apiName, options: apiOptions } = options;
	const url = resolveApiUrl(amplify, apiName, apiOptions?.queryParams);
	return createCancellableOperation(async abortSignal => {
		const libraryOptionsHeaders =
			await amplify.libraryOptions?.API?.REST?.headers({
				apiName,
			});
		const { headers: invocationHeaders = {} } = apiOptions;
		return transferHandler(amplify, {
			url,
			method,
			headers: {
				// custom headers from library options should be overwritten by invocation headers.
				...libraryOptionsHeaders,
				...invocationHeaders,
			},
			body: apiOptions?.body,
			abortSignal,
		});
	});
};

export const get = (amplify: AmplifyClassV6, input: GetInput): GetOperation =>
	publicHandler(amplify, input, 'GET');

export const post = (
	amplify: AmplifyClassV6,
	input: PostInput
): PostOperation => publicHandler(amplify, input, 'POST');

export const put = (amplify: AmplifyClassV6, input: PutInput): PutOperation =>
	publicHandler(amplify, input, 'PUT');

export const del = (
	amplify: AmplifyClassV6,
	input: DeleteInput
): DeleteOperation => publicHandler(amplify, input, 'DELETE');

export const head = (
	amplify: AmplifyClassV6,
	input: HeadInput
): HeadOperation => publicHandler(amplify, input, 'HEAD');

export const patch = (
	amplify: AmplifyClassV6,
	input: PatchInput
): PatchOperation => publicHandler(amplify, input, 'PATCH');
