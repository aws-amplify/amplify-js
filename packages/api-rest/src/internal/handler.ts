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
	unauthenticatedHandler,
	Headers,
	getRetryDecider,
	jitteredBackoff,
	userAgentMiddleware,
	UserAgentOptions,
} from '@aws-amplify/core/internals/aws-client-utils';
import { composeTransferHandler } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { DocumentType } from '../types';
import {
	createCancellableOperation,
	parseRestApiServiceError,
	parseUrl,
	resolveCredentials,
} from '../utils';
import { RestApiValidationErrorCode, assertValidationError } from '../errors';

interface HandlerOptions extends Omit<HttpRequest, 'body' | 'headers'> {
	body?: DocumentType | FormData;
	headers?: Headers;
	withCredentials?: boolean;
}

type HandlerConfigs = {
	defaultAuthMode: ApiAuthMode;
};

/**
 * @param amplify Amplify instance to to resolve credentials and tokens. Should use different instance in client-side
 *   and SSR
 * @param options Options accepted from public API options when calling the handlers.
 * @param configs Configs to configure internal behaviors.
 */
export const transferHandler = (
	amplify: AmplifyClassV6,
	options: HandlerOptions,
	configs: HandlerConfigs
) =>
	createCancellableOperation(abortSignal => {
		return transferHandlerJob(amplify, options, {
			...configs,
			abortSignal,
		});
	});

const transferHandlerJob = async (
	amplify: AmplifyClassV6,
	options: HandlerOptions,
	configs: HandlerConfigs & { abortSignal: AbortSignal }
) => {
	const { url, method, headers, body, withCredentials } = options;
	const { defaultAuthMode, abortSignal } = configs;
	const resolvedBody =
		body instanceof FormData ? body : JSON.stringify(body ?? '');
	const resolvedHeaders: Headers = {
		'content-type':
			body instanceof FormData
				? 'multipart/form-data'
				: 'application/json; charset=UTF-8',
		...headers,
	};
	const request = {
		url,
		headers: resolvedHeaders,
		method,
		body: resolvedBody,
	};
	const baseOptions = {
		retryDecider: getRetryDecider(parseRestApiServiceError),
		computeDelay: jitteredBackoff,
		withCrossDomainCredentials: withCredentials,
		abortSignal,
	};
	const optionalSigningHandler = composeOptionalSigningHandler();
	switch (defaultAuthMode.type) {
		case 'iam':
			const credentials = await resolveCredentials(amplify);
			const signingInfoFromUrl = parseUrl(url);
			const signingService =
				defaultAuthMode.service ?? signingInfoFromUrl.service;
			const signingRegion = defaultAuthMode.region ?? signingInfoFromUrl.region;

			return await optionalSigningHandler(request, {
				...baseOptions,
				credentials,
				region: signingRegion,
				service: signingService,
			});

		case 'apiKey':
			const { apiKey: apiKeyFromConfig } = defaultAuthMode;

			const apiKey = apiKeyFromConfig ?? headers['x-api-key'];
			assertValidationError(!!apiKey, RestApiValidationErrorCode.NoApiKey);
			return await unauthenticatedHandler(
				{
					...request,
					headers: {
						'x-api-key': apiKey,
						...request.headers,
					},
				},
				{
					...baseOptions,
				}
			);
		case 'lambda':
			assertValidationError(
				!!request.headers.authorization,
				RestApiValidationErrorCode.NoAuthHeader
			);
			return await unauthenticatedHandler(request, {
				...baseOptions,
			});
		case 'oidc':
		case 'userPool':
			// TODO: confirm default to access token.
			const { token = 'access' } = defaultAuthMode;
			const {
				tokens: { accessToken, idToken },
			} = await amplify.Auth.fetchAuthSession();
			const tokenToUse = token === 'access' ? accessToken : idToken;
			assertValidationError(
				!!tokenToUse,
				RestApiValidationErrorCode.NoAuthToken
			);
			return await unauthenticatedHandler(
				{
					...request,
					headers: {
						...request.headers,
						authorization: tokenToUse.toString(),
					},
				},
				{
					...baseOptions,
				}
			);
		case 'none':
			return await unauthenticatedHandler(request, {
				...baseOptions,
			});
		default:
			break;
	}
};

const composeOptionalSigningHandler = () => {
	const hasAuthHeader = (request: HttpRequest) =>
		!request.headers.authorization && !request.headers.Authorization;
	const optionalSigningMiddleware: Middleware<HttpRequest, HttpResponse, {}> = (
		options: SigningOptions
	) => {
		const signingHandler = signingMiddleware(options);
		return next => (request: HttpRequest) => {
			if (!hasAuthHeader(request)) {
				return signingHandler(next)(request);
			}
			return next(request);
		};
	};
	return composeTransferHandler<
		[UserAgentOptions, RetryOptions<HttpResponse>, SigningOptions],
		HttpRequest,
		HttpResponse,
		typeof fetchTransferHandler
	>(fetchTransferHandler, [
		userAgentMiddleware,
		retryMiddleware,
		optionalSigningMiddleware,
	]);
};
