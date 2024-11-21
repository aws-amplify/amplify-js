import { CookieStorage } from 'aws-amplify/adapter-core';

import {
	AUTH_FLOW_PROOF_COOKIE_EXPIRY,
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
	let nowSpy: jest.SpyInstance;

	beforeAll(() => {
		nowSpy = jest.spyOn(Date, 'now').mockReturnValue(0);
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	it('returns expected cookie serialization options with specified parameters', () => {
		const setCookieOptions: CookieStorage.SetCookieOptions = {
			domain: '.example.com',
			sameSite: 'strict',
		};

		const options = createAuthFlowProofCookiesSetOptions(setCookieOptions);

		expect(nowSpy).toHaveBeenCalled();
		expect(options).toEqual({
			domain: setCookieOptions?.domain,
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax' as const,
			expires: new Date(0 + AUTH_FLOW_PROOF_COOKIE_EXPIRY),
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
			expires: new Date('1970-01-01'),
		});
	});
});
