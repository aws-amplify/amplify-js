import { OAuthConfig } from '@aws-amplify/core';
import { NextApiRequest } from 'next';

import { handleAuthApiRouteRequestForPagesRouter } from '../../src/auth/handleAuthApiRouteRequestForPagesRouter';
import { CreateAuthRoutesHandlersInput } from '../../src/auth/types';
import {
	handleSignInCallbackRequestForPagesRouter,
	handleSignInSignUpRequestForPagesRouter,
	handleSignOutCallbackRequestForPagesRouter,
	handleSignOutRequestForPagesRouter,
} from '../../src/auth/handlers';

import { createMockNextApiResponse } from './testUtils';

jest.mock('../../src/auth/handlers');

const mockHandleSignInSignUpRequestForPagesRouter = jest.mocked(
	handleSignInSignUpRequestForPagesRouter,
);
const mockHandleSignOutRequestForPagesRouter = jest.mocked(
	handleSignOutRequestForPagesRouter,
);
const mockHandleSignInCallbackRequestForPagesRouter = jest.mocked(
	handleSignInCallbackRequestForPagesRouter,
);
const mockHandleSignOutCallbackRequestForPagesRouter = jest.mocked(
	handleSignOutCallbackRequestForPagesRouter,
);

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
	const {
		mockResponseAppendHeader,
		mockResponseEnd,
		mockResponseStatus,
		mockResponseSend,
		mockResponseRedirect,
		mockResponse,
	} = createMockNextApiResponse();

	afterEach(() => {
		mockResponseAppendHeader.mockClear();
		mockResponseEnd.mockClear();
		mockResponseStatus.mockClear();
		mockResponseSend.mockClear();
		mockResponseRedirect.mockClear();
	});

	it('sets response.status(405) when request has an unsupported method', () => {
		const mockRequest = { method: 'POST' } as any;

		handleAuthApiRouteRequestForPagesRouter({
			request: mockRequest,
			response: mockResponse,
			handlerInput: testHandlerInput,
			userPoolClientId: 'userPoolClientId',
			oAuthConfig: testOAuthConfig,
			setCookieOptions: testSetCookieOptions,
			origin: testOrigin,
		});

		expect(mockResponseStatus).toHaveBeenCalledWith(405);
		expect(mockResponseEnd).toHaveBeenCalled();
	});

	it('sets response.status(400) when request.query.slug is undefined', () => {
		const mockRequest = { method: 'GET', query: {} } as any;

		handleAuthApiRouteRequestForPagesRouter({
			request: mockRequest,
			response: mockResponse,
			userPoolClientId: 'userPoolClientId',
			handlerInput: testHandlerInput,
			oAuthConfig: testOAuthConfig,
			setCookieOptions: testSetCookieOptions,
			origin: testOrigin,
		});

		expect(mockResponseStatus).toHaveBeenCalledWith(400);
		expect(mockResponseEnd).toHaveBeenCalled();
	});

	it('sets response.status(404) when request.query.slug is is not a supported path', () => {
		const mockRequest = {
			method: 'GET',
			query: { slug: 'exchange-token' },
		} as any;

		handleAuthApiRouteRequestForPagesRouter({
			request: mockRequest,
			response: mockResponse,
			handlerInput: testHandlerInput,
			userPoolClientId: 'userPoolClientId',
			oAuthConfig: testOAuthConfig,
			setCookieOptions: testSetCookieOptions,
			origin: testOrigin,
		});

		expect(mockResponseStatus).toHaveBeenCalledWith(404);
		expect(mockResponseEnd).toHaveBeenCalled();
	});

	test.each([
		['sign-in', 'signIn'],
		['sign-up', 'signUp'],
	])(
		`calls handleSignInSignUpRequestForPagesRouter with correct params when handlerContext.params.slug is %s`,
		async (slug, expectedType) => {
			const mockRequest = {
				url: 'https://example.com/api/auth/sign-in',
				method: 'GET',
				query: { slug },
			} as unknown as NextApiRequest;

			await handleAuthApiRouteRequestForPagesRouter({
				request: mockRequest,
				response: mockResponse,
				handlerInput: testHandlerInput,
				userPoolClientId: 'userPoolClientId',
				oAuthConfig: testOAuthConfig,
				setCookieOptions: {},
				origin: testOrigin,
			});

			expect(mockHandleSignInSignUpRequestForPagesRouter).toHaveBeenCalledWith({
				request: mockRequest,
				response: mockResponse,
				userPoolClientId: 'userPoolClientId',
				oAuthConfig: testOAuthConfig,
				customState: testHandlerInput.customState,
				origin: testOrigin,
				setCookieOptions: {},
				type: expectedType,
			});
		},
	);

	it('calls handleSignOutRequest with correct params when handlerContext.params.slug is sign-out', async () => {
		const mockRequest = {
			url: 'https://example.com/api/auth/sign-in',
			method: 'GET',
			query: { slug: 'sign-out' },
		} as unknown as NextApiRequest;

		await handleAuthApiRouteRequestForPagesRouter({
			request: mockRequest,
			response: mockResponse,
			handlerInput: testHandlerInput,
			userPoolClientId: 'userPoolClientId',
			oAuthConfig: testOAuthConfig,
			setCookieOptions: {},
			origin: testOrigin,
		});

		expect(mockHandleSignOutRequestForPagesRouter).toHaveBeenCalledWith({
			response: mockResponse,
			userPoolClientId: 'userPoolClientId',
			oAuthConfig: testOAuthConfig,
			origin: testOrigin,
			setCookieOptions: {},
		});
	});

	it('calls handleSignInCallbackRequest with correct params when handlerContext.params.slug is sign-in-callback', async () => {
		const mockRequest = {
			url: 'https://example.com/api/auth/sign-in',
			method: 'GET',
			query: { slug: 'sign-in-callback' },
		} as unknown as NextApiRequest;

		await handleAuthApiRouteRequestForPagesRouter({
			request: mockRequest,
			response: mockResponse,
			handlerInput: testHandlerInput,
			userPoolClientId: 'userPoolClientId',
			oAuthConfig: testOAuthConfig,
			setCookieOptions: {},
			origin: testOrigin,
		});

		expect(mockHandleSignInCallbackRequestForPagesRouter).toHaveBeenCalledWith({
			request: mockRequest,
			response: mockResponse,
			handlerInput: testHandlerInput,
			oAuthConfig: testOAuthConfig,
			origin: testOrigin,
			setCookieOptions: {},
			userPoolClientId: 'userPoolClientId',
		});
	});

	it('calls handleSignOutCallbackRequest with correct params when handlerContext.params.slug is sign-out-callback', async () => {
		const mockRequest = {
			url: 'https://example.com/api/auth/sign-in',
			method: 'GET',
			query: { slug: 'sign-out-callback' },
		} as unknown as NextApiRequest;

		await handleAuthApiRouteRequestForPagesRouter({
			request: mockRequest,
			response: mockResponse,
			handlerInput: testHandlerInput,
			userPoolClientId: 'userPoolClientId',
			oAuthConfig: testOAuthConfig,
			setCookieOptions: {},
			origin: testOrigin,
		});

		expect(mockHandleSignOutCallbackRequestForPagesRouter).toHaveBeenCalledWith(
			{
				request: mockRequest,
				response: mockResponse,
				handlerInput: testHandlerInput,
				oAuthConfig: testOAuthConfig,
				setCookieOptions: {},
				userPoolClientId: 'userPoolClientId',
			},
		);
	});
});
