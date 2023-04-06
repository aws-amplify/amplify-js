import { Middleware, HttpRequest, HttpResponse } from '../../clients/types';
import { composeTransferHandler } from '../../clients/internal/composeTransferHandler';
import { fetchTransferHandler } from '../../clients/fetch';

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
	typeof fetchTransferHandler
>(fetchTransferHandler, [disableCacheMiddleware]);

export const defaultConfigs = {
	service: 'cognito-identity',
	endpointResolver: (endpointOptions: { region: string }) => ({
		url: new URL(
			`https://cognito-identity.${endpointOptions.region}.amazonaws.com`
		),
	}),
};
