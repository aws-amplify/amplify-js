import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';

import { NextRequest } from 'next/server.js';
import { NextApiRequest, NextApiResponse } from 'next';
import { parse as parseCookieHeader } from 'next/dist/compiled/cookie';
import { OAuthConfig } from 'aws-amplify/adapter-core/internals';
import { CookieStorage } from 'aws-amplify/adapter-core';

import { handleSignInCallbackRequest } from '../../../src/auth/handlers/handleSignInCallbackRequest';
import { handleSignInCallbackRequestForPagesRouter } from '../../../src/auth/handlers/handleSignInCallbackRequestForPagesRouter';
import { handleSignOutCallbackRequest } from '../../../src/auth/handlers/handleSignOutCallbackRequest';
import { handleSignOutCallbackRequestForPagesRouter } from '../../../src/auth/handlers/handleSignOutCallbackRequestForPagesRouter';
import {
	exchangeAuthNTokens,
	revokeAuthNTokens,
} from '../../../src/auth/utils';
import {
	IS_SIGNING_OUT_COOKIE_NAME,
	PKCE_COOKIE_NAME,
	STATE_COOKIE_NAME,
} from '../../../src/auth/constant';

// Only the network calls to Cognito are mocked, all cookie handling is real.
jest.mock('../../../src/auth/utils', () => ({
	...jest.requireActual('../../../src/auth/utils'),
	exchangeAuthNTokens: jest.fn(),
	revokeAuthNTokens: jest.fn(),
}));

const mockExchangeAuthNTokens = jest.mocked(exchangeAuthNTokens);
const mockRevokeAuthNTokens = jest.mocked(revokeAuthNTokens);

const base64UrlEncode = (value: string) =>
	Buffer.from(value, 'utf8').toString('base64url');

const createAccessToken = (username: string) =>
	[
		base64UrlEncode(JSON.stringify({ alg: 'RS256' })),
		base64UrlEncode(JSON.stringify({ username, exp: 9999999999 })),
		'signature',
	].join('.');

describe('server-side auth flows with a non-Latin-1 username', () => {
	const username = '用户';
	const userPoolClientId = 'clientId';
	const origin = 'https://example.com';
	const oAuthConfig = {
		domain: 'example.auth.us-east-1.amazoncognito.com',
		redirectSignIn: [`${origin}/api/auth/sign-in-callback`],
		redirectSignOut: [`${origin}/api/auth/sign-out-callback`],
	} as OAuthConfig;
	const setCookieOptions = {} as CookieStorage.SetCookieOptions;
	const handlerInput = {
		redirectOnSignInComplete: '/home',
		redirectOnSignOutComplete: '/sign-in',
	};
	const callbackUrl = `${origin}/api/auth/sign-in-callback?code=code&state=state`;
	const flowProofCookieHeader = `${PKCE_COOKIE_NAME}=pkce; ${STATE_COOKIE_NAME}=state`;
	const encodedLastAuthUserCookie = `CognitoIdentityServiceProvider.${userPoolClientId}.LastAuthUser=${encodeURIComponent(username)}`;
	const signOutCookieHeader = [
		`${IS_SIGNING_OUT_COOKIE_NAME}=true`,
		encodedLastAuthUserCookie,
		`CognitoIdentityServiceProvider.${userPoolClientId}.${encodeURIComponent(username)}.refreshToken=refresh-token`,
	].join('; ');

	const createPagesRouterResponse = () => {
		const response = new ServerResponse(
			new IncomingMessage(new Socket()),
		) as unknown as NextApiResponse;
		response.status = jest.fn(() => response);
		response.send = jest.fn();
		response.redirect = jest.fn() as unknown as NextApiResponse['redirect'];

		return response;
	};

	const createPagesRouterRequest = (url: string, cookieHeader: string) =>
		({
			url,
			cookies: parseCookieHeader(cookieHeader),
		}) as unknown as NextApiRequest;

	beforeEach(() => {
		mockExchangeAuthNTokens.mockResolvedValue({
			access_token: createAccessToken(username),
			id_token: 'id-token',
			refresh_token: 'refresh-token',
			token_type: 'Bearer',
			expires_in: 3600,
		});
		mockRevokeAuthNTokens.mockResolvedValue({});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('sets the auth cookies on the App Router sign-in callback', async () => {
		const request = new NextRequest(callbackUrl, {
			headers: { Cookie: flowProofCookieHeader },
		});

		const response = await handleSignInCallbackRequest({
			request,
			handlerInput,
			userPoolClientId,
			oAuthConfig,
			setCookieOptions,
			origin,
		});

		expect(response.status).toBe(200);
		expect(response.headers.getSetCookie()).toEqual(
			expect.arrayContaining([
				expect.stringContaining(`${encodedLastAuthUserCookie};`),
			]),
		);
	});

	it('sets the auth cookies on the Pages Router sign-in callback', async () => {
		const request = createPagesRouterRequest(
			callbackUrl,
			flowProofCookieHeader,
		);
		const response = createPagesRouterResponse();

		await handleSignInCallbackRequestForPagesRouter({
			request,
			response,
			handlerInput,
			userPoolClientId,
			oAuthConfig,
			setCookieOptions,
			origin,
		});

		expect(response.status).toHaveBeenCalledWith(200);
		expect(response.getHeader('Set-Cookie')).toEqual(
			expect.arrayContaining([
				expect.stringContaining(`${encodedLastAuthUserCookie};`),
			]),
		);
	});

	it('revokes the refresh token on the App Router sign-out callback', async () => {
		const request = new NextRequest(`${origin}/api/auth/sign-out-callback`, {
			headers: { Cookie: signOutCookieHeader },
		});

		const response = await handleSignOutCallbackRequest({
			request,
			handlerInput,
			userPoolClientId,
			oAuthConfig,
			setCookieOptions,
			origin,
		});

		expect(mockRevokeAuthNTokens).toHaveBeenCalledWith({
			refreshToken: 'refresh-token',
			userPoolClientId,
			endpointDomain: oAuthConfig.domain,
		});
		expect(response.status).toBe(302);
	});

	it('revokes the refresh token on the Pages Router sign-out callback', async () => {
		const request = createPagesRouterRequest(
			`${origin}/api/auth/sign-out-callback`,
			signOutCookieHeader,
		);
		const response = createPagesRouterResponse();

		await handleSignOutCallbackRequestForPagesRouter({
			request,
			response,
			handlerInput,
			userPoolClientId,
			oAuthConfig,
			setCookieOptions,
			origin,
		});

		expect(mockRevokeAuthNTokens).toHaveBeenCalledWith({
			refreshToken: 'refresh-token',
			userPoolClientId,
			endpointDomain: oAuthConfig.domain,
		});
	});
});
