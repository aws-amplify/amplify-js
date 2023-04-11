import { Middleware, HttpRequest, HttpResponse } from '../../clients/types';
import { composeTransferHandler } from '../../clients/internal/composeTransferHandler';
import { unAuthenticatedHandler } from '../../clients/handlers/unauth';
import {
	jitteredBackoff,
	getRetryDecider,
} from '../../clients/middleware/retry';
import { loadErrorCode } from '../../clients/serde/json';

const disableCacheMiddleware: Middleware<HttpRequest, HttpResponse, {}> =
	() => (next, context) =>
		async function disableCacheMiddleware(request) {
			request.headers['cache-control'] = 'no-store';
			return next(request);
		};

export const cognitoIdentityTransferHandler = composeTransferHandler<
	[unknown],
	HttpRequest,
	HttpResponse,
	typeof unAuthenticatedHandler
>(unAuthenticatedHandler, [disableCacheMiddleware]);

export const defaultConfigs = {
	service: 'cognito-identity',
	endpointResolver: (endpointOptions: { region: string }) => ({
		url: new URL(
			`https://cognito-identity.${endpointOptions.region}.amazonaws.com`
		),
	}),
	retryDecider: getRetryDecider(loadErrorCode),
	computeDelay: jitteredBackoff,
};
