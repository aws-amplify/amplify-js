import { CookieStorage } from 'aws-amplify/adapter-core';

import {
	AUTH_FLOW_PROOF_MAX_AGE,
	IS_SIGNING_OUT_COOKIE_NAME,
	PKCE_COOKIE_NAME,
	STATE_COOKIE_NAME,
} from '../../../src/auth/constant';
import {
	createAuthFlowProofCookiesRemoveOptions,
	createAuthFlowProofCookiesSetOptions,
	createSignInFlowProofCookies,
	createSignOutFlowProofCookies,
} from '../../../src/auth/utils/authFlowProofCookies';

describe('createSignInFlowProofCookies', () => {
	it('returns PKCE and state cookies', () => {
		const state = 'state';
		const pkce = 'pkce';
		const cookies = createSignInFlowProofCookies({ state, pkce });
		expect(cookies.sort()).toEqual(
			[
				{ name: PKCE_COOKIE_NAME, value: pkce },
				{ name: STATE_COOKIE_NAME, value: state },
			].sort(),
		);
	});
});

describe('createSignOutFlowProofCookies', () => {
	it('returns IS_SIGNING_OUT cookie', () => {
		const cookies = createSignOutFlowProofCookies();
		expect(cookies).toEqual([
			{ name: IS_SIGNING_OUT_COOKIE_NAME, value: 'true' },
		]);
	});
});

describe('createAuthFlowProofCookiesSetOptions', () => {
	it('returns expected cookie serialization options with specified parameters', () => {
		const setCookieOptions: CookieStorage.SetCookieOptions = {
			domain: '.example.com',
			sameSite: 'strict',
		};

		const options = createAuthFlowProofCookiesSetOptions(
			setCookieOptions,
			'https://example.com',
		);

		expect(options).toEqual({
			domain: setCookieOptions?.domain,
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax' as const,
			maxAge: AUTH_FLOW_PROOF_MAX_AGE,
		});
	});

	it('returns expected cookie serialization options with specified parameters with overridden secure attribute', () => {
		const setCookieOptions: CookieStorage.SetCookieOptions = {
			domain: '.example.com',
			sameSite: 'strict',
		};

		const options = createAuthFlowProofCookiesSetOptions(
			setCookieOptions,
			'http://example.com',
		);

		expect(options).toEqual({
			domain: setCookieOptions?.domain,
			path: '/',
			httpOnly: true,
			secure: false,
			sameSite: 'lax' as const,
			maxAge: AUTH_FLOW_PROOF_MAX_AGE,
		});
	});
});

describe('createAuthFlowProofCookiesRemoveOptions', () => {
	it('returns expected cookie removal options with specified parameters', () => {
		const setCookieOptions: CookieStorage.SetCookieOptions = {
			domain: '.example.com',
		};

		const options = createAuthFlowProofCookiesRemoveOptions(setCookieOptions);

		expect(options).toEqual({
			domain: setCookieOptions?.domain,
			path: '/',
			maxAge: -1,
		});
	});
});
