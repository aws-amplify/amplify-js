// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	Endpoint,
	EndpointResolverOptions,
	Headers,
	HttpRequest,
	HttpResponse,
	Middleware,
	getDnsSuffix,
	unauthenticatedHandler,
	parseJsonError,
	getRetryDecider,
	jitteredBackoff,
} from '@aws-amplify/core/internals/aws-client-utils';
import {
	getAmplifyUserAgent,
	AmplifyUrl,
} from '@aws-amplify/core/internals/utils';
import { composeTransferHandler } from '@aws-amplify/core/internals/aws-client-utils/composers';

/**
 * The service name used to sign requests if the API requires authentication.
 */
const SERVICE_NAME = 'cognito-idp';

/**
 * The endpoint resolver function that returns the endpoint URL for a given region.
 */
const endpointResolver = ({ region }: EndpointResolverOptions) => {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	const customURL = authConfig?.userPoolEndpoint;
	const defaultURL = new AmplifyUrl(
		`https://${SERVICE_NAME}.${region}.${getDnsSuffix(region)}`
	);

	return {
		url: customURL ? new AmplifyUrl(customURL) : defaultURL,
	};
};

/**
 * A Cognito Identity-specific middleware that disables caching for all requests.
 */
const disableCacheMiddleware: Middleware<HttpRequest, HttpResponse, {}> =
	() => (next, context) =>
		async function disableCacheMiddleware(request) {
			request.headers['cache-control'] = 'no-store';
			return next(request);
		};

/**
 * A Cognito Identity-specific transfer handler that does NOT sign requests, and
 * disables caching.
 *
 * @internal
 */
export const cognitoUserPoolTransferHandler = composeTransferHandler<
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

/**
 * @internal
 */
export const getSharedHeaders = (operation: string): Headers => ({
	'content-type': 'application/x-amz-json-1.1',
	'x-amz-target': `AWSCognitoIdentityProviderService.${operation}`,
});

/**
 * @internal
 */
export const buildHttpRpcRequest = (
	{ url }: Endpoint,
	headers: Headers,
	body: string
): HttpRequest => ({
	headers,
	url,
	body,
	method: 'POST',
});
