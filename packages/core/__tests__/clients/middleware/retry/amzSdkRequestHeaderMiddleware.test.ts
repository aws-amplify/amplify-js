// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	HttpRequest,
	HttpResponse,
	Middleware,
	MiddlewareHandler,
} from '../../../../src/clients/types';
import { composeTransferHandler } from '../../../../src/clients/internal/composeTransferHandler';
import { amzSdkRequestHeaderMiddlewareFactory } from '../../../../src/clients/middleware/retry/amzSdkRequestHeaderMiddleware';

describe('retry info middleware', () => {
	const getRetryInfoHandler = (
		coreHandler: MiddlewareHandler<HttpRequest, HttpResponse>,
		prevMiddleware: Middleware<HttpRequest, HttpResponse, object>,
	) =>
		composeTransferHandler<[any, any], HttpRequest, HttpResponse>(coreHandler, [
			prevMiddleware,
			amzSdkRequestHeaderMiddlewareFactory,
		]);

	it('should add current attempt and max attempt to request headers', async () => {
		const coreHandler = jest.fn();
		const retryInfoHandler = getRetryInfoHandler(
			coreHandler,
			() => (next, context) => request => {
				context.attemptsCount = 2;

				return next(request);
			},
		);
		await retryInfoHandler(
			{
				url: new URL('https://example.com'),
				method: 'GET',
				headers: {},
			},
			{
				maxAttempts: 4,
			},
		);

		expect(coreHandler).toHaveBeenCalledWith(
			{
				url: new URL('https://example.com'),
				method: 'GET',
				headers: {
					'amz-sdk-request': 'attempt=3; max=4',
				},
			},
			expect.anything(),
		);
	});
});
