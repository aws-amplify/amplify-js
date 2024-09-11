import { OAuthConfig } from '@aws-amplify/core';

import { handleAuthApiRouteRequestForPagesRouter } from '../../src/auth/handleAuthApiRouteRequestForPagesRouter';
import { CreateAuthRoutesHandlersInput } from '../../src/auth/types';

describe('handleAuthApiRouteRequestForPagesRouter', () => {
	const testOrigin = 'https://example.com';
	const testHandlerInput: CreateAuthRoutesHandlersInput = {
		redirectOnSignInComplete: '/home',
		redirectOnSignOutComplete: 'sign-in',
	};
	const testOAuthConfig: OAuthConfig = {
		domain: 'example.com',
		redirectSignIn: ['https://example.com/signin'],
		redirectSignOut: ['https://example.com/signout'],
		responseType: 'code',
		scopes: ['openid', 'email'],
	};
	const testSetCookieOptions = {};

	it('sets response.status(405) when request has an unsupported method', () => {
		const mockEnd = jest.fn();
		const mockStatus = jest.fn(() => ({ end: mockEnd }));
		const mockRequest = { method: 'POST' } as any;
		const mockResponse = { status: mockStatus } as any;

		handleAuthApiRouteRequestForPagesRouter({
			request: mockRequest,
			response: mockResponse,
			handlerInput: testHandlerInput,
			oAuthConfig: testOAuthConfig,
			setCookieOptions: testSetCookieOptions,
			origin: testOrigin,
		});

		expect(mockStatus).toHaveBeenCalledWith(405);
		expect(mockEnd).toHaveBeenCalled();
	});

	it('sets response.status(400) when request.query.slug is undefined', () => {
		const mockEnd = jest.fn();
		const mockStatus = jest.fn(() => ({ end: mockEnd }));
		const mockRequest = { method: 'GET', query: {} } as any;
		const mockResponse = { status: mockStatus } as any;

		handleAuthApiRouteRequestForPagesRouter({
			request: mockRequest,
			response: mockResponse,
			handlerInput: testHandlerInput,
			oAuthConfig: testOAuthConfig,
			setCookieOptions: testSetCookieOptions,
			origin: testOrigin,
		});

		expect(mockStatus).toHaveBeenCalledWith(400);
		expect(mockEnd).toHaveBeenCalled();
	});

	it('sets response.status(404) when request.query.slug is is not a supported path', () => {
		const mockEnd = jest.fn();
		const mockStatus = jest.fn(() => ({ end: mockEnd }));
		const mockRequest = {
			method: 'GET',
			query: { slug: 'exchange-token' },
		} as any;
		const mockResponse = { status: mockStatus } as any;

		handleAuthApiRouteRequestForPagesRouter({
			request: mockRequest,
			response: mockResponse,
			handlerInput: testHandlerInput,
			oAuthConfig: testOAuthConfig,
			setCookieOptions: testSetCookieOptions,
			origin: testOrigin,
		});

		expect(mockStatus).toHaveBeenCalledWith(404);
		expect(mockEnd).toHaveBeenCalled();
	});

	// TODO(HuiSF): add use cases tests for each supported path when implemented
	it('sets response.status(501) when handlerContext.params.slug is a supported path', () => {
		const mockEnd = jest.fn();
		const mockStatus = jest.fn(() => ({ end: mockEnd }));
		const mockRequest = {
			method: 'GET',
			query: { slug: 'sign-in' },
		} as any;
		const mockResponse = { status: mockStatus } as any;

		handleAuthApiRouteRequestForPagesRouter({
			request: mockRequest,
			response: mockResponse,
			handlerInput: testHandlerInput,
			oAuthConfig: testOAuthConfig,
			setCookieOptions: testSetCookieOptions,
			origin: testOrigin,
		});

		expect(mockStatus).toHaveBeenCalledWith(501);
		expect(mockEnd).toHaveBeenCalled();
	});
});
