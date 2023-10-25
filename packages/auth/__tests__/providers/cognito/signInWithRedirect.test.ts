// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthError } from '../../../src/errors/AuthError';
import {
	INVALID_ORIGIN_EXCEPTION,
	INVALID_REDIRECT_EXCEPTION,
} from '../../../src/errors/constants';
import { getRedirectUrl } from '../../../src/providers/cognito/utils/oauth/getRedirectUrl';
import { getRedirectUrl as getRedirectUrlRN } from '../../../src/providers/cognito/utils/oauth/getRedirectUrl.native';

describe('signInWithRedirect API', () => {
	it('should pass correct arguments to oauth', () => {
		// TODO ADD tests
	});

	it('should try to clear oauth data before starting an oauth flow.', async () => {
		// TODO: ADD Test: previous test was invalid
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

	it('should throw if the url is not comming from the same origin', async () => {
		Object.defineProperty(globalThis, 'window', {
			value: {
				location: { origin: 'https://differentorigin.com', pathname: '/app' },
			},
			writable: true,
		});

		try {
			return getRedirectUrl(['http://localhost:3000/', 'https://example.com/']);
		} catch (error) {
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
		} catch (error) {
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
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(INVALID_REDIRECT_EXCEPTION);
		}
	});
});
