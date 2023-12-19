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
} from '../../types';
import {
	resolveApiUrl,
	createCancellableOperation,
	logger,
	parseSigningInfo,
} from '../../utils';
import { transferHandler } from './handler';

const publicHandler = (
	amplify: AmplifyClassV6,
	options: ApiInput<RestApiOptionsBase>,
	method: string
) =>
	createCancellableOperation(async abortSignal => {
		const { apiName, options: apiOptions = {}, path: apiPath } = options;
		const url = resolveApiUrl(
			amplify,
			apiName,
			apiPath,
			apiOptions?.queryParams
		);
		const libraryConfigHeaders =
			await amplify.libraryOptions?.API?.REST?.headers?.({
				apiName,
			});
		const { headers: invocationHeaders = {} } = apiOptions;
		const headers = {
			// custom headers from invocation options should precede library options
			...libraryConfigHeaders,
			...invocationHeaders,
		};
		const signingServiceInfo = parseSigningInfo(url, {
			amplify,
			apiName,
		});
		logger.debug(
			method,
			url,
			headers,
			`IAM signing options: ${JSON.stringify(signingServiceInfo)}`
		);
		return transferHandler(
			amplify,
			{
				...apiOptions,
				url,
				method,
				headers,
				abortSignal,
			},
			signingServiceInfo
		);
	});

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
