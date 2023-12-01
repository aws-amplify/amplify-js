// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthError } from '../../../src/errors/AuthError';
import { Hub } from '@aws-amplify/core';
import {
	INVALID_ORIGIN_EXCEPTION,
	INVALID_REDIRECT_EXCEPTION,
} from '../../../src/errors/constants';
import { getRedirectUrl } from '../../../src/providers/cognito/utils/oauth/getRedirectUrl';
import { getRedirectUrl as getRedirectUrlRN } from '../../../src/providers/cognito/utils/oauth/getRedirectUrl.native';
import {
	parseRedirectURL,
	signInWithRedirect,
} from '../../../src/providers/cognito/apis/signInWithRedirect';
import { openAuthSession } from '../../../src/utils';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';
jest.mock('../../../src/utils/openAuthSession');
jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: {
		getConfig: jest.fn(() => ({
			Auth: {
				Cognito: {
					userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
					identityPoolId: 'us-west-2:xxxxxx',
					loginWith: {
						oauth: {
							domain: 'my_cognito_domain',
							redirectSignIn: ['http://localhost:3000/'],
							redirectSignOut: ['http://localhost:3000/'],
							responseType: 'code',
							scopes: [
								'email',
								'openid',
								'profile',
								'aws.cognito.signin.user.admin',
							],
						},
					},
				},
			},
		})),
	},
	Hub: { dispatch: jest.fn(), listen: jest.fn() },
}));

describe('signInWithRedirect API', () => {
	it('should pass correct arguments to oauth', () => {
		// TODO ADD tests
	});

	it('should try to clear oauth data before starting an oauth flow.', async () => {
		// TODO: ADD Test: previous test was invalid
	});
});

describe('signInWithRedirect API error cases', () => {
	const oauthErrorMessage = 'an oauth error has occurred';
	const oauthError = new AuthError({
		name: 'OAuthSignInException',
		message: oauthErrorMessage,
	});
	const mockOpenAuthSession = openAuthSession as jest.Mock;

	it('should throw and dispatch when an error is returned in the URL in RN', async () => {
		mockOpenAuthSession.mockResolvedValueOnce({
			type: 'error',
			error: oauthErrorMessage,
		});

		try {
			await signInWithRedirect();
			expect(Hub.dispatch).toHaveBeenCalledWith(
				'auth',
				{
					event: 'signInWithRedirect_failure',
					data: {
						error: oauthError,
					},
				},
				'Auth',
				AMPLIFY_SYMBOL
			);
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(oauthError.name);
		}
	});

	it('should throw when state is not valid after calling signInWithRedirect', async () => {
		mockOpenAuthSession.mockResolvedValueOnce({
			type: 'success',
			url: 'http:localhost:3000/oauth2/redirect?state=invalid_state&code=mock_code&scope=openid%20email%20profile&session_state=mock_session_state',
		});
		try {
			await signInWithRedirect();
			expect(Hub.dispatch).toHaveBeenCalledWith(
				'auth',
				{
					event: 'signInWithRedirect_failure',
					data: {
						error: oauthError,
					},
				},
				'Auth',
				AMPLIFY_SYMBOL
			);
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.message).toBe(
				'An error occurred while validating the state'
			);
		}
	});

	it('should dispatch the signInWithRedirect_failure event when an error is returned in the URL', async () => {
		Object.defineProperty(window, 'location', {
			value: {
				href: 'http:localhost:3000/oauth2/redirect?error=OAuthSignInException&error_description=an+oauth+error+has+occurred',
			},
			writable: true,
		});
		expect(parseRedirectURL).not.toThrow();
		await parseRedirectURL();
		expect(Hub.dispatch).toHaveBeenCalledWith(
			'auth',
			{
				event: 'signInWithRedirect_failure',
				data: {
					error: oauthError,
				},
			},
			'Auth',
			AMPLIFY_SYMBOL
		);
	});

	it('should dispatch the signInWithRedirect_failure event when state is not valid', async () => {
		Object.defineProperty(window, 'location', {
			value: {
				href: `http:localhost:3000/oauth2/redirect?state='invalid_state'&code=mock_code&scope=openid%20email%20profile&session_state=mock_session_state`,
			},
			writable: true,
		});
		expect(parseRedirectURL).not.toThrow();
		await parseRedirectURL();
		expect(Hub.dispatch).toHaveBeenCalledWith(
			'auth',
			{
				event: 'signInWithRedirect_failure',
				data: {
					error: oauthError,
				},
			},
			'Auth',
			AMPLIFY_SYMBOL
		);
	});
});

describe('getRedirectUrl on web', () => {
	const originalWindowLocation = window.location;

	const currentWindownLocationParamsList: {
		origin: string;
		pathname: string;
	}[] = [
		{ origin: 'https://example.com', pathname: '/' },
		{ origin: 'https://example.com', pathname: '/app' },
		{ origin: 'https://example.com', pathname: '/app/page' },
		{ origin: 'http://localhost:3000', pathname: '/' },
		{ origin: 'http://localhost:3000', pathname: '/app' },
	];
	afterEach(() => {
		Object.defineProperty(globalThis, 'window', {
			value: originalWindowLocation,
		});
	});
	it.each(currentWindownLocationParamsList)(
		'should pick the url that matches the current window',
		async windowParams => {
			const { origin, pathname } = windowParams;
			Object.defineProperty(globalThis, 'window', {
				value: { location: { origin, pathname } },
				writable: true,
			});
			const redirectsFromConfig = [
				'http://localhost:3000/',
				'https://example.com/',
				'https://example.com/app',
				'https://example.com/app/page',
				'http://localhost:3000/app',
			];
			const redirect = getRedirectUrl(redirectsFromConfig);
			expect(redirect).toBe(
				redirectsFromConfig.find(redir => redir === redirect)
			);
		}
	);
	it('should pick the first url that is comming from a different pathname but same domain', async () => {
		Object.defineProperty(globalThis, 'window', {
			value: {
				location: {
					origin: 'https://example.com',
					pathname: '/app',
					hostname: 'example.com',
				},
			},
			writable: true,
		});
		const redirect = getRedirectUrl(['https://example.com/another-app']);
		expect(redirect).toBe('https://example.com/another-app');
	});

	it('should throw if the url is not comming from the same origin', async () => {
		Object.defineProperty(globalThis, 'window', {
			value: {
				location: { origin: 'https://differentorigin.com', pathname: '/app' },
			},
			writable: true,
		});

		try {
			return getRedirectUrl(['http://localhost:3000/', 'https://example.com/']);
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(INVALID_ORIGIN_EXCEPTION);
		}
	});

	it('should throw if the url is not found or invalid', async () => {
		Object.defineProperty(globalThis, 'window', {
			value: {
				location: { origin: 'http://localhost:3000', pathname: '/' },
			},
			writable: true,
		});

		try {
			return getRedirectUrl(['novalid']);
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(INVALID_REDIRECT_EXCEPTION);
		}
	});
});

describe('getRedirectUrl on React Native', () => {
	it('should pick the first non http or https redirect', async () => {
		const redirect = getRedirectUrlRN([
			'app:custom',
			'https://example.com/',
			'http://localhost:3000/',
		]);
		expect(redirect).toBe('app:custom');
	});
	it('should throw if the redirect is invalid or not found', async () => {
		try {
			return getRedirectUrlRN(['invalid']);
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(INVALID_REDIRECT_EXCEPTION);
		}
	});
});
