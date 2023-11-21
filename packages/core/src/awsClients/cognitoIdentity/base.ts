// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Endpoint,
	EndpointResolverOptions,
	Headers,
	HttpRequest,
	HttpResponse,
	Middleware,
	getDnsSuffix,
	parseJsonError,
	unauthenticatedHandler,
} from '~/src/clients';
import { composeTransferHandler } from '~/src/clients/internal/composeTransferHandler';
import {
	getRetryDecider,
	jitteredBackoff,
} from '~/src/clients/middleware/retry';
import { getAmplifyUserAgent } from '~/src/Platform';
import { observeFrameworkChanges } from '~/src/Platform/detectFramework';
import { AmplifyUrl } from '~/src/utils/amplifyUrl';

/**
 * The service name used to sign requests if the API requires authentication.
 */
const SERVICE_NAME = 'cognito-identity';

/**
 * The endpoint resolver function that returns the endpoint URL for a given region.
 */
const endpointResolver = ({ region }: EndpointResolverOptions) => ({
	url: new AmplifyUrl(
		`https://cognito-identity.${region}.${getDnsSuffix(region)}`,
	),
});

/**
 * A Cognito Identity-specific middleware that disables caching for all requests.
 */
const disableCacheMiddleware: Middleware<HttpRequest, HttpResponse, object> =
	() => next => async request => {
		request.headers['cache-control'] = 'no-store';

		return next(request);
	};

/**
 * A Cognito Identity-specific transfer handler that does NOT sign requests, and
 * disables caching.
 *
 * @internal
 */
export const cognitoIdentityTransferHandler = composeTransferHandler<
	[Parameters<typeof disableCacheMiddleware>[0]],
	HttpRequest,
	HttpResponse,
	typeof unauthenticatedHandler
>(unauthenticatedHandler, [disableCacheMiddleware]);

/**
 * @internal
 */
export const defaultConfig = {
	service: SERVICE_NAME,
	endpointResolver,
	retryDecider: getRetryDecider(parseJsonError),
	computeDelay: jitteredBackoff,
	userAgentValue: getAmplifyUserAgent(),
	cache: 'no-store',
};

observeFrameworkChanges(() => {
	defaultConfig.userAgentValue = getAmplifyUserAgent();
});

/**
 * @internal
 */
export const getSharedHeaders = (operation: string): Headers => ({
	'content-type': 'application/x-amz-json-1.1',
	'x-amz-target': `AWSCognitoIdentityService.${operation}`,
});

/**
 * @internal
 */
export const buildHttpRpcRequest = (
	{ url }: Endpoint,
	headers: Headers,
	body: any,
): HttpRequest => ({
	headers,
	url,
	body,
	method: 'POST',
});
