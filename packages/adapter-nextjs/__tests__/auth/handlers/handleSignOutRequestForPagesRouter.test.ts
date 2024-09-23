/**
 * @jest-environment node
 */
import { OAuthConfig } from '@aws-amplify/core';

import { handleSignOutRequestForPagesRouter } from '../../../src/auth/handlers/handleSignOutRequestForPagesRouter';
import {
	appendSetCookieHeadersToNextApiResponse,
	createAuthFlowProofCookiesSetOptions,
	createLogoutEndpoint,
	createSignOutFlowProofCookies,
	isNonSSLOrigin,
	resolveRedirectSignOutUrl,
} from '../../../src/auth/utils';
import { createMockNextApiResponse } from '../testUtils';

jest.mock('../../../src/auth/utils');

const mockAppendSetCookieHeadersToNextApiResponse = jest.mocked(
	appendSetCookieHeadersToNextApiResponse,
);
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
	const {
		mockResponseAppendHeader,
		mockResponseEnd,
		mockResponseStatus,
		mockResponseSend,
		mockResponseRedirect,
		mockResponse,
	} = createMockNextApiResponse();

	beforeAll(() => {
		mockIsNonSSLOrigin.mockReturnValue(true);
	});

	afterEach(() => {
		mockAppendSetCookieHeadersToNextApiResponse.mockClear();
		mockCreateAuthFlowProofCookiesSetOptions.mockClear();
		mockCreateLogoutEndpoint.mockClear();
		mockCreateSignOutFlowProofCookies.mockClear();
		mockResolveRedirectSignOutUrl.mockClear();

		mockResponseAppendHeader.mockClear();
		mockResponseEnd.mockClear();
		mockResponseStatus.mockClear();
		mockResponseSend.mockClear();
		mockResponseRedirect.mockClear();
	});

	it('returns a 302 response with the correct headers and cookies', () => {
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
		mockAppendSetCookieHeadersToNextApiResponse.mockImplementationOnce(
			response => {
				response.appendHeader('Set-Cookie', 'mockName=mockValue');
			},
		);

		handleSignOutRequestForPagesRouter({
			response: mockResponse,
			oAuthConfig: mockOAuthConfig,
			userPoolClientId: mockUserPoolClientId,
			origin: mockOrigin,
			setCookieOptions: mockSetCookieOptions,
		});

		// verify the response
		expect(mockResponseRedirect).toHaveBeenCalledWith(
			302,
			'https://id.amazoncognito.com/logout',
		);
		expect(mockResponseAppendHeader).toHaveBeenCalledWith(
			'Set-Cookie',
			'mockName=mockValue',
		);

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
	});
});
