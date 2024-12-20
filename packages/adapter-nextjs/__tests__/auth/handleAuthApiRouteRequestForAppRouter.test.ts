/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { OAuthConfig } from '@aws-amplify/core';

import { handleAuthApiRouteRequestForAppRouter } from '../../src/auth/handleAuthApiRouteRequestForAppRouter';
import { CreateAuthRoutesHandlersInput } from '../../src/auth/types';

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

	it('returns a 405 response when input.request has an unsupported method', () => {
		const request = new NextRequest(
			new URL('https://example.com/api/auth/sign-in'),
			{
				method: 'POST',
			},
		);
		const response = handleAuthApiRouteRequestForAppRouter({
			request,
			handlerContext: testHandlerContext,
			handlerInput: testHandlerInput,
			oAuthConfig: testOAuthConfig,
			setCookieOptions: {},
			origin: testOrigin,
		});

		expect(response.status).toBe(405);
	});

	it('returns a 400 response when handlerContext.params.slug is undefined', () => {
		const request = new NextRequest(
			new URL('https://example.com/api/auth/sign-in'),
			{
				method: 'GET',
			},
		);
		const response = handleAuthApiRouteRequestForAppRouter({
			request,
			handlerContext: { params: { slug: undefined } },
			handlerInput: testHandlerInput,
			oAuthConfig: testOAuthConfig,
			setCookieOptions: {},
			origin: testOrigin,
		});

		expect(response.status).toBe(400);
	});

	it('returns a 404 response when handlerContext.params.slug is not a supported path', () => {
		const request = new NextRequest(
			new URL('https://example.com/api/auth/exchange-token'),
			{
				method: 'GET',
			},
		);
		const response = handleAuthApiRouteRequestForAppRouter({
			request,
			handlerContext: { params: { slug: 'exchange-token' } },
			handlerInput: testHandlerInput,
			oAuthConfig: testOAuthConfig,
			setCookieOptions: {},
			origin: testOrigin,
		});

		expect(response.status).toBe(404);
	});

	// TODO(HuiSF): add use cases tests for each supported path when implemented
	it('returns a 501 response when handlerContext.params.slug is a supported path', () => {
		const request = new NextRequest(
			new URL('https://example.com/api/auth/sign-in'),
			{
				method: 'GET',
			},
		);
		const response = handleAuthApiRouteRequestForAppRouter({
			request,
			handlerContext: { params: { slug: 'sign-in' } },
			handlerInput: testHandlerInput,
			oAuthConfig: testOAuthConfig,
			setCookieOptions: {},
			origin: testOrigin,
		});

		expect(response.status).toBe(501);
	});
});
