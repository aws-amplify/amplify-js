import type {
	Endpoint,
	Headers,
	HttpRequest,
	HttpResponse,
	Middleware,
} from '../../clients/types';
import { composeTransferHandler } from '../../clients/internal/composeTransferHandler';
import { unauthenticatedHandler } from '../../clients/handlers/unauthenticated';
import {
	jitteredBackoff,
	getRetryDecider,
} from '../../clients/middleware/retry';
import { parseJsonError } from '../../clients/serde/json';
import { getAmplifyUserAgent } from '../../Platform';

/**
 * The service name used to sign requests if the API requires authentication.
 */
const SERVICE_NAME = 'cognito-identity';

/**
 * The endpoint resolver function that returns the endpoint URL for a given region.
 */
const endpointResolver = (endpointOptions: { region: string }) => ({
	url: new URL(
		`https://cognito-identity.${endpointOptions.region}.amazonaws.com`
	),
});

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
export const cognitoIdentityTransferHandler = composeTransferHandler<
	[Parameters<typeof disableCacheMiddleware>[0]],
	HttpRequest,
	HttpResponse,
	typeof unauthenticatedHandler
>(unauthenticatedHandler, [disableCacheMiddleware]);

/**
 * @internal
 */
export const defaultConfigs = {
	service: SERVICE_NAME,
	endpointResolver,
	retryDecider: getRetryDecider(parseJsonError),
	computeDelay: jitteredBackoff,
	userAgentValue: getAmplifyUserAgent(), // TODO: use getAmplifyUserAgentString() when available.
};

/**
 * @internal
 */
export const sharedHeaders = (operation: string): Headers => ({
	'content-type': 'application/x-amz-json-1.1',
	'x-amz-target': `AWSCognitoIdentityService.${operation}`,
});

/**
 * @internal
 */
export const buildHttpRpcRequest = (
	{ url }: Endpoint,
	headers: Headers,
	body: any
): HttpRequest => ({
	headers,
	url,
	body,
	method: 'POST',
});
