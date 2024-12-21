import { OAuthConfig } from '@aws-amplify/core';

import { OAuthTokenExchangeResult } from '../../../src/auth/types';
import {
	exchangeAuthNTokens,
	revokeAuthNTokens,
} from '../../../src/auth/utils';

const mockFetchFunc = jest.fn();
const mockFetch = () => {
	const originalFetch = global.fetch;
	global.fetch = mockFetchFunc;

	return originalFetch;
};

const unMockFetch = (originalFetch: typeof global.fetch) => {
	global.fetch = originalFetch;
};

// The following tests also covered the following functions exported from `src/auth/utils/cognitoHostedUIEndpoints.ts`:
// - createTokenEndpoint
// - createRevokeEndpoint
describe('exchangeAuthNTokens', () => {
	let originalFetch: typeof global.fetch;

	beforeAll(() => {
		originalFetch = mockFetch();
	});

	afterEach(() => {
		mockFetchFunc.mockClear();
	});

	afterAll(() => {
		unMockFetch(originalFetch);
	});

	it('returns OAuthTokenExchangeResult when token exchange succeeded', async () => {
		const mockResult: OAuthTokenExchangeResult = {
			access_token: 'access_token',
			id_token: 'id_token',
			refresh_token: 'refresh_token',
			token_type: 'token_type',
			expires_in: 3600,
		};
		const mockJson = jest.fn().mockResolvedValueOnce(mockResult);
		const mockUserPoolClientId = 'userPoolClientId';
		const mockRedirectUri = 'https://example.com';
		const mockOAuthConfig = {
			domain: 'aaa.amazoncongito.com',
		} as unknown as OAuthConfig;
		const mockCode = 'code';
		const mockCodeVerifier = 'codeVerifier';

		mockFetchFunc.mockResolvedValue({
			json: mockJson,
		});

		const result = await exchangeAuthNTokens({
			redirectUri: mockRedirectUri,
			userPoolClientId: mockUserPoolClientId,
			oAuthConfig: mockOAuthConfig,
			code: mockCode,
			codeVerifier: mockCodeVerifier,
		});

		expect(result).toEqual(mockResult);
		expect(mockFetchFunc).toHaveBeenCalledWith(
			`https://${mockOAuthConfig.domain}/oauth2/token`,
			expect.objectContaining({
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Cache-Control': 'no-cache',
				},
				body: new URLSearchParams({
					client_id: mockUserPoolClientId,
					code: mockCode,
					redirect_uri: mockRedirectUri,
					code_verifier: mockCodeVerifier,
					grant_type: 'authorization_code',
				}).toString(),
			}),
		);
	});

	it('returns OAuthTokenExchangeResult with error when token exchange encountered error', async () => {
		const mockResult = {
			error: 'invalid_request',
		};
		const mockJson = jest.fn().mockResolvedValueOnce(mockResult);
		const mockUserPoolClientId = 'userPoolClientId';
		const mockRedirectUri = 'https://example.com';
		const mockOAuthConfig = {
			domain: 'aaa.amazoncongito.com',
		} as unknown as OAuthConfig;
		const mockCode = 'code';
		const mockCodeVerifier = 'codeVerifier';

		mockFetchFunc.mockResolvedValue({
			json: mockJson,
		});

		const result = await exchangeAuthNTokens({
			redirectUri: mockRedirectUri,
			userPoolClientId: mockUserPoolClientId,
			oAuthConfig: mockOAuthConfig,
			code: mockCode,
			codeVerifier: mockCodeVerifier,
		});

		expect(mockJson).toHaveBeenCalled();
		expect(result).toEqual(mockResult);
	});
});

describe('revokeAuthNTokens', () => {
	let originalFetch: typeof global.fetch;

	beforeAll(() => {
		originalFetch = mockFetch();
	});

	afterEach(() => {
		mockFetchFunc.mockClear();
	});

	afterAll(() => {
		unMockFetch(originalFetch);
	});

	it('returns OAuthTokenRevocationResult when token revocation succeeded', async () => {
		const mockResponse = {
			headers: {
				get: jest.fn(),
			},
		};
		const mockUserPoolClientId = 'userPoolClientId';
		const mockOAuthConfig = {
			domain: 'aaa.amazoncongito.com',
		} as unknown as OAuthConfig;
		const mockRefreshToken = 'refreshToken';
		mockFetchFunc.mockResolvedValueOnce(mockResponse);

		const result = await revokeAuthNTokens({
			userPoolClientId: mockUserPoolClientId,
			refreshToken: mockRefreshToken,
			endpointDomain: mockOAuthConfig.domain,
		});

		expect(result).toEqual({});
		expect(mockFetchFunc).toHaveBeenCalledWith(
			`https://${mockOAuthConfig.domain}/oauth2/revoke`,
			expect.objectContaining({
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Cache-Control': 'no-cache',
				},
				body: new URLSearchParams({
					client_id: mockUserPoolClientId,
					token: mockRefreshToken,
				}).toString(),
			}),
		);
	});

	it('returns OAuthTokenRevocationResult with error when token revocation encountered error', async () => {
		const mockJson = jest.fn().mockResolvedValueOnce({
			error: 'invalid_request',
		});
		const mockResponse = {
			headers: {
				get: jest.fn(() => 20),
			},
			json: mockJson,
		};
		const mockUserPoolClientId = 'userPoolClientId';
		const mockOAuthConfig = {
			domain: 'aaa.amazoncongito.com',
		} as unknown as OAuthConfig;
		const mockRefreshToken = 'refreshToken';
		const mockResult = {
			error: 'invalid_request',
		};

		mockFetchFunc.mockResolvedValueOnce(mockResponse);

		const result = await revokeAuthNTokens({
			userPoolClientId: mockUserPoolClientId,
			refreshToken: mockRefreshToken,
			endpointDomain: mockOAuthConfig.domain,
		});

		expect(mockJson).toHaveBeenCalled();
		expect(result).toEqual(mockResult);
	});
});
