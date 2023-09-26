// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyClassV6 } from '@aws-amplify/core';
import { ApiAuthMode } from '@aws-amplify/core/internals/utils';
import {
	HttpRequest,
	fetchTransferHandler,
	signingMiddleware,
	retryMiddleware,
	RetryOptions,
	HttpResponse,
	SigningOptions,
	Middleware,
} from '@aws-amplify/core/internals/aws-client-utils';
import { composeTransferHandler } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { DocumentType } from '../types';
import { parseUrl, resolveCredentials } from '../utils';
import { RestApiValidationErrorCode, assertValidationError } from '../errors';

interface HandlerInput extends Omit<HttpRequest, 'body'> {
	body: DocumentType | FormData;
}

type HandlerOptions = {
	defaultAuthMode: ApiAuthMode;
};

/**
 *
 * TODO: support user agent suffix.
 */
export const handle = async (
	amplify: AmplifyClassV6,
	input: HandlerInput,
	options: HandlerOptions
) => {
	const { url, method, headers, body } = input;
	const { defaultAuthMode } = options;
	const resolvedBody =
		body instanceof FormData ? body : JSON.stringify(body ?? '');
	const resolvedHeaders = {
		'content-type':
			body instanceof FormData
				? 'multipart/form-data'
				: 'application/json; charset=UTF-8',
	};
	const request = {
		url,
		headers: resolvedHeaders,
		method,
		body: resolvedBody,
	};
	const retryOptions = {
		// TODO
		retryDecider: async () => false,
		// TODO
		computeDelay: () => 0,
	};
	switch (defaultAuthMode.type) {
		case 'iam':
			const credentials = await resolveCredentials(amplify);
			const signingInfoFromUrl = parseUrl(url);
			const signingService =
				defaultAuthMode.service ?? signingInfoFromUrl.service;
			const signingRegion = defaultAuthMode.region ?? signingInfoFromUrl.region;

			const iamHandler = composeTransferHandler<
				[RetryOptions<HttpResponse>, SigningOptions],
				HttpRequest,
				HttpResponse,
				typeof fetchTransferHandler
			>(fetchTransferHandler, [retryMiddleware, signingMiddleware]);

			return await iamHandler(request, {
				...retryOptions,
				credentials,
				region: signingRegion,
				service: signingService,
			});
		case 'apiKey':
			const { apiKey } = defaultAuthMode;
			assertValidationError(!!apiKey, RestApiValidationErrorCode.NoApiKey);
			const assignApiKeyMiddleware: Middleware<HttpRequest, HttpResponse, {}> =
				() => next => (request: HttpRequest) => {
					request.headers['x-api-key'] = apiKey;
					return next(request);
				};
			const apiKeyHandler = composeTransferHandler<
				[{}, RetryOptions<HttpResponse>],
				HttpRequest,
				HttpResponse,
				typeof fetchTransferHandler
			>(fetchTransferHandler, [assignApiKeyMiddleware, retryMiddleware]);
			return await apiKeyHandler(request, {
				...retryOptions,
			});
		case 'lambda':
			const lambdaHandler = composeHandlerRequiringAuthHeader();
			return await lambdaHandler(request, {
				...retryOptions,
			});
		case 'custom': // TODO: rename to none
			const noneHandler = composeTransferHandler<
				[RetryOptions<HttpResponse>],
				HttpRequest,
				HttpResponse,
				typeof fetchTransferHandler
			>(fetchTransferHandler, [retryMiddleware]);
			return await noneHandler(request, {
				...retryOptions,
			});
		case 'jwt':
			// TODO: change to oidc and user_pool
			const jwtHandler = composeHandlerRequiringAuthHeader();
			return await jwtHandler(request, { ...retryOptions });
		default:
			break;
	}
};

const composeHandlerRequiringAuthHeader = () => {
	const verifyAuthHeaderMiddleware: Middleware<HttpRequest, HttpResponse, {}> =
		() => next => (request: HttpRequest) => {
			assertValidationError(
				!!request.headers.authorization || !!request.headers.Authorization,
				RestApiValidationErrorCode.NoAuthHeader
			);
			return next(request);
		};
	return composeTransferHandler<
		[{}, RetryOptions<HttpResponse>],
		HttpRequest,
		HttpResponse,
		typeof fetchTransferHandler
	>(fetchTransferHandler, [verifyAuthHeaderMiddleware, retryMiddleware]);
};
