/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { OAuthConfig } from '@aws-amplify/core';

import { handleAuthApiRouteRequestForAppRouter } from '../../src/auth/handleAuthApiRouteRequestForAppRouter';
import { CreateAuthRoutesHandlersInput } from '../../src/auth/types';
import {
	handleSignInCallbackRequest,
	handleSignInSignUpRequest,
	handleSignOutCallbackRequest,
	handleSignOutRequest,
} from '../../src/auth/handlers';
import { NextServer } from '../../src';
import {
	hasUserSignedInWithAppRouter,
	isSupportedAuthApiRoutePath,
} from '../../src/auth/utils';

jest.mock('../../src/auth/handlers');
jest.mock('../../src/auth/utils');

const mockHandleSignInSignUpRequest = jest.mocked(handleSignInSignUpRequest);
const mockHandleSignOutRequest = jest.mocked(handleSignOutRequest);
const mockHandleSignInCallbackRequest = jest.mocked(
	handleSignInCallbackRequest,
);
const mockHandleSignOutCallbackRequest = jest.mocked(
	handleSignOutCallbackRequest,
);
const mockHasUserSignedInWithAppRouter = jest.mocked(
	hasUserSignedInWithAppRouter,
);
const mockIsSupportedAuthApiRoutePath = jest.mocked(
	isSupportedAuthApiRoutePath,
);
const mockRunWithAmplifyServerContext =
	jest.fn() as jest.MockedFunction<NextServer.RunOperationWithContext>;

describe('handleAuthApiRouteRequestForAppRouter', () => {
	const testOrigin = 'https://example.com';
	const testHandlerInput: CreateAuthRoutesHandlersInput = {
		redirectOnSignInComplete: '/home',
		redirectOnSignOutComplete: 'sign-in',
	};
	const testHandlerContext = { params: { slug: 'sign-in' } };
	const testOAuthConfig: OAuthConfig = {
		domain: 'example.com',
		redirectSignIn: ['https://example.com/signin'],
		redirectSignOut: ['https://example.com/signout'],
		responseType: 'code',
		scopes: ['openid', 'email'],
	};
	const _ = handleAuthApiRouteRequestForAppRouter;

	beforeAll(() => {
		mockHasUserSignedInWithAppRouter.mockResolvedValue(false);
		mockIsSupportedAuthApiRoutePath.mockReturnValue(true);
	});

	it('returns a 405 response when input.request has an unsupported method', async () => {
		const request = new NextRequest(
			new URL('https://example.com/api/auth/sign-in'),
			{
				method: 'POST',
			},
		);
		const response = await handleAuthApiRouteRequestForAppRouter({
			request,
			handlerContext: testHandlerContext,
			handlerInput: testHandlerInput,
			userPoolClientId: 'userPoolClientId',
			oAuthConfig: testOAuthConfig,
			setCookieOptions: {},
			origin: testOrigin,
			runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
		});

		expect(response.status).toBe(405);
	});

	it('returns a 400 response when handlerContext.params.slug is undefined', async () => {
		const request = new NextRequest(
			new URL('https://example.com/api/auth/sign-in'),
			{
				method: 'GET',
			},
		);
		const response = await handleAuthApiRouteRequestForAppRouter({
			request,
			handlerContext: { params: { slug: undefined } },
			handlerInput: testHandlerInput,
			userPoolClientId: 'userPoolClientId',
			oAuthConfig: testOAuthConfig,
			setCookieOptions: {},
			origin: testOrigin,
			runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
		});

		expect(response.status).toBe(400);
	});

	it('returns a 404 response when handlerContext.params.slug is not a supported path', async () => {
		const request = new NextRequest(
			new URL('https://example.com/api/auth/exchange-token'),
			{
				method: 'GET',
			},
		);

		mockIsSupportedAuthApiRoutePath.mockReturnValueOnce(false);

		const response = await handleAuthApiRouteRequestForAppRouter({
			request,
			handlerContext: { params: { slug: 'exchange-token' } },
			handlerInput: testHandlerInput,
			userPoolClientId: 'userPoolClientId',
			oAuthConfig: testOAuthConfig,
			setCookieOptions: {},
			origin: testOrigin,
			runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
		});

		expect(response.status).toBe(404);
	});

	test.each([
		['sign-in', 'signIn'],
		['sign-up', 'signUp'],
	])(
		`calls handleSignInSignUpRequest with correct params when handlerContext.params.slug is %s`,
		async (slug, expectedType) => {
			const mockRequest = new NextRequest(
				new URL('https://example.com/api/auth/sign-in'),
				{
					method: 'GET',
				},
			);
			const mockResponse = new Response(null, { status: 302 });

			mockHandleSignInSignUpRequest.mockReturnValueOnce(mockResponse);

			const response = await handleAuthApiRouteRequestForAppRouter({
				request: mockRequest,
				handlerContext: { params: { slug } },
				handlerInput: testHandlerInput,
				userPoolClientId: 'userPoolClientId',
				oAuthConfig: testOAuthConfig,
				setCookieOptions: {},
				origin: testOrigin,
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
			});

			expect(response).toBe(mockResponse);
			expect(mockHandleSignInSignUpRequest).toHaveBeenCalledWith({
				request: mockRequest,
				userPoolClientId: 'userPoolClientId',
				oAuthConfig: testOAuthConfig,
				customState: testHandlerInput.customState,
				origin: testOrigin,
				setCookieOptions: {},
				type: expectedType,
			});
		},
	);

	test.each([['sign-in'], ['sign-up']])(
		`calls hasUserSignedInWithAppRouter with correct params when handlerContext.params.slug is %s, and when it returns true, the handler returns a 302 response`,
		async slug => {
			mockHasUserSignedInWithAppRouter.mockResolvedValueOnce(true);
			const mockRequest = new NextRequest(
				new URL('https://example.com/api/auth/sign-in'),
				{
					method: 'GET',
				},
			);

			const response = await handleAuthApiRouteRequestForAppRouter({
				request: mockRequest,
				handlerContext: { params: { slug } },
				handlerInput: {
					...testHandlerInput,
					redirectOnSignInComplete: undefined,
				},
				userPoolClientId: 'userPoolClientId',
				oAuthConfig: testOAuthConfig,
				setCookieOptions: {},
				origin: testOrigin,
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
			});

			expect(response.status).toBe(302);
			expect(response.headers.get('Location')).toBe('/');
		},
	);

	it('calls handleSignOutRequest with correct params when handlerContext.params.slug is sign-out', async () => {
		const mockRequest = new NextRequest(
			new URL('https://example.com/api/auth/sign-out'),
			{
				method: 'GET',
			},
		);
		const mockResponse = new Response(null, { status: 302 });

		mockHandleSignOutRequest.mockReturnValueOnce(mockResponse);

		const response = await handleAuthApiRouteRequestForAppRouter({
			request: mockRequest,
			handlerContext: { params: { slug: 'sign-out' } },
			handlerInput: testHandlerInput,
			userPoolClientId: 'userPoolClientId',
			oAuthConfig: testOAuthConfig,
			setCookieOptions: {},
			origin: testOrigin,
			runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
		});

		expect(response).toBe(mockResponse);
		expect(mockHandleSignOutRequest).toHaveBeenCalledWith({
			userPoolClientId: 'userPoolClientId',
			oAuthConfig: testOAuthConfig,
			origin: testOrigin,
			setCookieOptions: {},
		});
	});

	it('calls handleSignInCallbackRequest with correct params when handlerContext.params.slug is sign-in-callback', async () => {
		const mockRequest = new NextRequest(
			new URL('https://example.com/api/auth/sign-in-callback'),
			{
				method: 'GET',
			},
		);
		const mockResponse = new Response(null, { status: 302 });

		mockHandleSignInCallbackRequest.mockResolvedValueOnce(mockResponse);

		const response = await handleAuthApiRouteRequestForAppRouter({
			request: mockRequest,
			handlerContext: { params: { slug: 'sign-in-callback' } },
			handlerInput: testHandlerInput,
			userPoolClientId: 'userPoolClientId',
			oAuthConfig: testOAuthConfig,
			setCookieOptions: {},
			origin: testOrigin,
			runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
		});

		expect(response).toBe(mockResponse);
		expect(mockHandleSignInCallbackRequest).toHaveBeenCalledWith({
			request: mockRequest,
			handlerInput: testHandlerInput,
			oAuthConfig: testOAuthConfig,
			origin: testOrigin,
			setCookieOptions: {},
			userPoolClientId: 'userPoolClientId',
		});
	});

	it('calls handleSignOutCallbackRequest with correct params when handlerContext.params.slug is sign-out-callback', async () => {
		const mockRequest = new NextRequest(
			new URL('https://example.com/api/auth/sign-out-callback'),
			{
				method: 'GET',
			},
		);
		const mockResponse = new Response(null, { status: 302 });

		mockHandleSignOutCallbackRequest.mockResolvedValueOnce(mockResponse);

		const response = await handleAuthApiRouteRequestForAppRouter({
			request: mockRequest,
			handlerContext: { params: { slug: 'sign-out-callback' } },
			handlerInput: testHandlerInput,
			userPoolClientId: 'userPoolClientId',
			oAuthConfig: testOAuthConfig,
			setCookieOptions: {},
			origin: testOrigin,
			runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
		});

		expect(response).toBe(mockResponse);
		expect(mockHandleSignOutCallbackRequest).toHaveBeenCalledWith({
			request: mockRequest,
			handlerInput: testHandlerInput,
			oAuthConfig: testOAuthConfig,
			setCookieOptions: {},
			userPoolClientId: 'userPoolClientId',
		});
	});
});
