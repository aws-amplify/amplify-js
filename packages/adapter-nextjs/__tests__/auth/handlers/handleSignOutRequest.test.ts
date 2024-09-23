/**
 * @jest-environment node
 */
import { OAuthConfig } from '@aws-amplify/core';

import { handleSignOutRequest } from '../../../src/auth/handlers/handleSignOutRequest';
import {
	appendSetCookieHeaders,
	createAuthFlowProofCookiesSetOptions,
	createLogoutEndpoint,
	createSignOutFlowProofCookies,
	isNonSSLOrigin,
	resolveRedirectSignOutUrl,
} from '../../../src/auth/utils';

jest.mock('../../../src/auth/utils');

const mockAppendSetCookieHeaders = jest.mocked(appendSetCookieHeaders);
const mockCreateAuthFlowProofCookiesSetOptions = jest.mocked(
	createAuthFlowProofCookiesSetOptions,
);
const mockCreateLogoutEndpoint = jest.mocked(createLogoutEndpoint);
const mockCreateSignOutFlowProofCookies = jest.mocked(
	createSignOutFlowProofCookies,
);
const mockResolveRedirectSignOutUrl = jest.mocked(resolveRedirectSignOutUrl);
const mockIsNonSSLOrigin = jest.mocked(isNonSSLOrigin);

describe('handleSignOutRequest', () => {
	beforeAll(() => {
		mockIsNonSSLOrigin.mockReturnValue(true);
	});

	afterEach(() => {
		mockAppendSetCookieHeaders.mockClear();
		mockCreateAuthFlowProofCookiesSetOptions.mockClear();
		mockCreateLogoutEndpoint.mockClear();
		mockCreateSignOutFlowProofCookies.mockClear();
		mockResolveRedirectSignOutUrl.mockClear();
		mockIsNonSSLOrigin.mockClear();
	});

	it('returns a 302 response with the correct headers and cookies', async () => {
		const mockOAuthConfig = { domain: 'mockDomain' } as unknown as OAuthConfig;
		const mockUserPoolClientId = 'mockUserPoolClientId';
		const mockOrigin = 'https://example.com';
		const mockSetCookieOptions = { domain: '.example.com' };

		mockResolveRedirectSignOutUrl.mockReturnValueOnce(
			'https://example.com/sign-out',
		);
		mockCreateLogoutEndpoint.mockReturnValueOnce(
			'https://id.amazoncognito.com/logout',
		);
		const mockCreateSignOutFlowProofCookiesResult = [
			{
				name: 'mockName',
				value: 'mockValue',
			},
		];
		mockCreateSignOutFlowProofCookies.mockReturnValueOnce(
			mockCreateSignOutFlowProofCookiesResult,
		);
		const mockCreateAuthFlowProofCookiesSetOptionsResult = {
			domain: mockSetCookieOptions.domain,
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax' as const,
			expires: new Date('2024-09-18'),
		};
		mockCreateAuthFlowProofCookiesSetOptions.mockReturnValueOnce(
			mockCreateAuthFlowProofCookiesSetOptionsResult,
		);
		mockAppendSetCookieHeaders.mockImplementationOnce(headers => {
			headers.append('Set-Cookie', 'mockName=mockValue');
		});

		const response = await handleSignOutRequest({
			oAuthConfig: mockOAuthConfig,
			userPoolClientId: mockUserPoolClientId,
			origin: mockOrigin,
			setCookieOptions: mockSetCookieOptions,
		});

		// verify the response
		expect(response.status).toBe(302);
		expect(response.headers.get('Location')).toBe(
			'https://id.amazoncognito.com/logout',
		);
		expect(response.headers.get('Set-Cookie')).toBe('mockName=mockValue');

		// verify calls to dependencies
		expect(mockResolveRedirectSignOutUrl).toHaveBeenCalledWith(
			mockOrigin,
			mockOAuthConfig,
		);
		expect(mockCreateLogoutEndpoint).toHaveBeenCalledWith(
			mockOAuthConfig.domain,
			expect.any(URLSearchParams),
		);
		expect(mockCreateSignOutFlowProofCookies).toHaveBeenCalled();
		expect(mockIsNonSSLOrigin).toHaveBeenCalledWith(mockOrigin);
		expect(mockCreateAuthFlowProofCookiesSetOptions).toHaveBeenCalledWith(
			mockSetCookieOptions,
			{
				secure: true,
			},
		);
		expect(mockAppendSetCookieHeaders).toHaveBeenCalledWith(
			expect.any(Headers),
			mockCreateSignOutFlowProofCookiesResult,
			mockCreateAuthFlowProofCookiesSetOptionsResult,
		);
	});
});
