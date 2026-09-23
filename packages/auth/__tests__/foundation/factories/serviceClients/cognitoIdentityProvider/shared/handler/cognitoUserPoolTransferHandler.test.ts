// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AmplifyContext,
	getGlobalContext,
	hasGlobalContext,
} from '@aws-amplify/core';
import { unauthenticatedHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { composeTransferHandler } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { cognitoUserPoolTransferHandler } from '../../../../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/shared/handler';

jest.mock('@aws-amplify/core');
jest.mock('@aws-amplify/core/internals/aws-client-utils');
jest.mock('@aws-amplify/core/internals/aws-client-utils/composers');

const mockComposeTransferHandler = jest.mocked(composeTransferHandler);
const mockUnauthenticatedHandler = jest.mocked(unauthenticatedHandler);
const mockGetGlobalContext = jest.mocked(getGlobalContext);
const mockHasGlobalContext = jest.mocked(hasGlobalContext);

/**
 * Builds a minimal branded-less AmplifyContext test double whose libraryOptions
 * carry the given custom Auth `headers` function.
 */
const buildCtxWithHeaders = (
	headers?: () => Promise<Record<string, string>>,
): AmplifyContext => ({
	resourcesConfig: {},
	libraryOptions: headers ? { Auth: { headers } } : {},
	token: Object.freeze({ value: Symbol('test-ctx') }),
	fetchAuthSession: jest.fn(),
	clearCredentials: jest.fn(),
	getTokens: jest.fn(),
});

describe('cognitoUserPoolTransferHandler', () => {
	beforeAll(() => {
		// need to make sure cognitoUserPoolTransferHandler is imported and used in
		// the scope of the test
		const _ = cognitoUserPoolTransferHandler;
	});

	afterEach(() => {
		mockGetGlobalContext.mockReset();
		mockHasGlobalContext.mockReset();
	});

	it('adds the disableCacheMiddlewareFactory at module loading', async () => {
		mockHasGlobalContext.mockReturnValue(true);
		mockGetGlobalContext.mockReturnValue(buildCtxWithHeaders());

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

	it('attaches custom headers from the global context libraryOptions when configured', async () => {
		const mockHeaders = jest.fn().mockResolvedValue({
			'custom-header': 'custom-value',
		});
		mockHasGlobalContext.mockReturnValue(true);
		mockGetGlobalContext.mockReturnValue(buildCtxWithHeaders(mockHeaders));

		const [, middleware] = mockComposeTransferHandler.mock.calls[0];
		const disableCacheMiddlewareFactory = middleware[0] as any;
		const middlewareFn = disableCacheMiddlewareFactory()(jest.fn());
		const mockRequest = { headers: {} as Record<string, string> };

		await middlewareFn(mockRequest);

		expect(mockHeaders).toHaveBeenCalled();
		expect(mockRequest.headers['custom-header']).toBe('custom-value');
	});

	it('does not attach custom headers when libraryOptions has no headers', async () => {
		mockHasGlobalContext.mockReturnValue(true);
		mockGetGlobalContext.mockReturnValue(buildCtxWithHeaders());

		const [, middleware] = mockComposeTransferHandler.mock.calls[0];
		const disableCacheMiddlewareFactory = middleware[0] as any;
		const mockNext = jest.fn();
		const middlewareFn = disableCacheMiddlewareFactory()(mockNext);
		const mockRequest = { headers: {} as Record<string, string> };

		await middlewareFn(mockRequest);

		expect(mockRequest.headers['custom-header']).toBeUndefined();
		expect(mockNext).toHaveBeenCalledWith(mockRequest);
	});

	it('does not throw and attaches no custom headers when no global context is set', async () => {
		// Edge path: handler runs before configure(). It must degrade to no
		// custom headers rather than throwing (getGlobalContext is never called).
		mockHasGlobalContext.mockReturnValue(false);

		const [, middleware] = mockComposeTransferHandler.mock.calls[0];
		const disableCacheMiddlewareFactory = middleware[0] as any;
		const mockNext = jest.fn();
		const middlewareFn = disableCacheMiddlewareFactory()(mockNext);
		const mockRequest = { headers: {} as Record<string, string> };

		await expect(middlewareFn(mockRequest)).resolves.not.toThrow();

		expect(mockGetGlobalContext).not.toHaveBeenCalled();
		expect(mockRequest.headers['custom-header']).toBeUndefined();
		expect(mockRequest.headers['cache-control']).toBe('no-store');
		expect(mockNext).toHaveBeenCalledWith(mockRequest);
	});
});
