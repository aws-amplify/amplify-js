// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

import {
	ApiInput,
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
	RestApiOptionsBase,
} from '../../types';
import {
	createCancellableOperation,
	logger,
	parseSigningInfo,
	resolveApiUrl,
} from '../../utils';
import { isIamAuthApplicableForRest } from '../../utils/isIamAuthApplicable';

import { transferHandler } from './transferHandler';

const publicHandler = (
	amplify: AmplifyContext,
	options: ApiInput<RestApiOptionsBase>,
	method: string,
) => {
	const { apiName, options: apiOptions = {}, path: apiPath } = options;
	const libraryConfigTimeout = amplify.libraryOptions?.API?.REST?.timeout?.({
		apiName,
		method,
	});
	const timeout = apiOptions?.timeout || libraryConfigTimeout || undefined;
	const publicApisAbortController = new AbortController();
	const abortSignal = publicApisAbortController.signal;

	return createCancellableOperation(
		async () => {
			const url = resolveApiUrl(
				amplify,
				apiName,
				apiPath,
				apiOptions?.queryParams,
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
				`IAM signing options: ${JSON.stringify(signingServiceInfo)}`,
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
				isIamAuthApplicableForRest,
				signingServiceInfo,
			);
		},
		publicApisAbortController,
		'public', // operation Type
		timeout,
	);
};

export const get = (amplify: AmplifyContext, input: GetInput): GetOperation =>
	publicHandler(amplify, input, 'GET');

export const post = (
	amplify: AmplifyContext,
	input: PostInput,
): PostOperation => publicHandler(amplify, input, 'POST');

export const put = (amplify: AmplifyContext, input: PutInput): PutOperation =>
	publicHandler(amplify, input, 'PUT');

export const del = (
	amplify: AmplifyContext,
	input: DeleteInput,
): DeleteOperation => publicHandler(amplify, input, 'DELETE');

export const head = (
	amplify: AmplifyContext,
	input: HeadInput,
): HeadOperation => publicHandler(amplify, input, 'HEAD');

export const patch = (
	amplify: AmplifyContext,
	input: PatchInput,
): PatchOperation => publicHandler(amplify, input, 'PATCH');
