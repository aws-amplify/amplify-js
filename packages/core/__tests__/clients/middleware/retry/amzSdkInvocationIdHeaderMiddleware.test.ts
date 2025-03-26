// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	HttpRequest,
	HttpResponse,
	MiddlewareHandler,
} from '../../../../src/clients/types';
import { composeTransferHandler } from '../../../../src/clients/internal/composeTransferHandler';
import { amzSdkInvocationIdHeaderMiddlewareFactory } from '../../../../src/clients/middleware/retry/amzSdkInvocationIdHeaderMiddleware';

describe('invocation id middleware', () => {
	const getInvocationIdHandler = (
		nextHandler: MiddlewareHandler<HttpRequest, HttpResponse>,
	) =>
		composeTransferHandler<[object], HttpRequest, HttpResponse>(nextHandler, [
			amzSdkInvocationIdHeaderMiddlewareFactory,
		]);

	it('should add invocation id to request headers', async () => {
		expect.assertions(2);
		const nextHandler = jest.fn().mockResolvedValue({
			statusCode: 200,
			headers: {},
		});
		const invocationIdHandler = getInvocationIdHandler(nextHandler);
		try {
			await invocationIdHandler(
				{
					url: new URL('https://a.b'),
					method: 'GET',
					headers: {},
				},
				{},
			);
			expect(nextHandler).toHaveBeenCalledTimes(1);
			const uuidV4Regex =
				/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
			expect(nextHandler).toHaveBeenCalledWith(
				expect.objectContaining({
					headers: expect.objectContaining({
						'amz-sdk-invocation-id': expect.stringMatching(uuidV4Regex),
					}),
				}),
				expect.anything(),
			);
		} catch (error) {
			fail('this test should succeed');
		}
	});

	it('should NOT overwrite invocation id to request headers', async () => {
		expect.assertions(1);
		const nextHandler = jest.fn().mockResolvedValue({
			statusCode: 200,
			headers: {},
		});
		const invocationIdHandler = getInvocationIdHandler(nextHandler);
		try {
			await invocationIdHandler(
				{
					url: new URL('https://a.b'),
					method: 'GET',
					headers: {
						'amz-sdk-invocation-id': 'something',
					},
				},
				{},
			);
			expect(nextHandler).toHaveBeenCalledWith(
				expect.objectContaining({
					headers: expect.objectContaining({
						'amz-sdk-invocation-id': 'something',
					}),
				}),
				expect.anything(),
			);
		} catch (error) {
			fail('this test should succeed');
		}
	});
});
