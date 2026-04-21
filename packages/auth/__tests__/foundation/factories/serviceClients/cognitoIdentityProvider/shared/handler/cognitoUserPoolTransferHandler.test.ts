import { Amplify } from '@aws-amplify/core';
import { unauthenticatedHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { composeTransferHandler } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { cognitoUserPoolTransferHandler } from '../../../../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/shared/handler';

jest.mock('@aws-amplify/core');
jest.mock('@aws-amplify/core/internals/aws-client-utils');
jest.mock('@aws-amplify/core/internals/aws-client-utils/composers');

const mockComposeTransferHandler = jest.mocked(composeTransferHandler);
const mockUnauthenticatedHandler = jest.mocked(unauthenticatedHandler);

describe('cognitoUserPoolTransferHandler', () => {
	beforeAll(() => {
		// need to make sure cognitoUserPoolTransferHandler is imported and used in
		// the scope of the test
		const _ = cognitoUserPoolTransferHandler;
	});

	it('adds the disableCacheMiddlewareFactory at module loading', async () => {
		expect(mockComposeTransferHandler).toHaveBeenCalledTimes(1);

		const [core, middleware] = mockComposeTransferHandler.mock.calls[0];

		expect(core).toStrictEqual(mockUnauthenticatedHandler);
		expect(middleware).toHaveLength(1);

		const disableCacheMiddlewareFactory = middleware[0] as any;
		const disableCacheMiddlewarePendingNext = disableCacheMiddlewareFactory();

		const mockNext = jest.fn();
		const disableCacheMiddleware = disableCacheMiddlewarePendingNext(mockNext);
		const mockRequest = {
			headers: {},
		};

		await disableCacheMiddleware(mockRequest);

		expect(mockNext).toHaveBeenCalledWith(mockRequest);
		expect(mockRequest.headers).toEqual({
			'cache-control': 'no-store',
		});
	});

	it('attaches custom headers from libraryOptions when configured', async () => {
		const mockHeaders = jest.fn().mockResolvedValue({
			'custom-header': 'custom-value',
		});
		(Amplify as any).libraryOptions = {
			Auth: { headers: mockHeaders },
		};

		const [, middleware] = mockComposeTransferHandler.mock.calls[0];
		const disableCacheMiddlewareFactory = middleware[0] as any;
		const middlewareFn = disableCacheMiddlewareFactory()(jest.fn());
		const mockRequest = { headers: {} as Record<string, string> };

		await middlewareFn(mockRequest);

		expect(mockHeaders).toHaveBeenCalled();
		expect(mockRequest.headers['custom-header']).toBe('custom-value');
	});

	it('does not attach custom headers when not configured', async () => {
		(Amplify as any).libraryOptions = {};

		const [, middleware] = mockComposeTransferHandler.mock.calls[0];
		const disableCacheMiddlewareFactory = middleware[0] as any;
		const mockNext = jest.fn();
		const middlewareFn = disableCacheMiddlewareFactory()(mockNext);
		const mockRequest = { headers: {} as Record<string, string> };

		await middlewareFn(mockRequest);

		expect(mockRequest.headers['custom-header']).toBeUndefined();
		expect(mockNext).toHaveBeenCalledWith(mockRequest);
	});
});
