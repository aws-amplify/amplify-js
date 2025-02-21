import {
	createUrlSearchParamsForSignInSignUp,
	createUrlSearchParamsForTokenExchange,
	createUrlSearchParamsForTokenRevocation,
} from '../../../src/auth/utils/createUrlSearchParams';

describe('createUrlSearchParamsForSignInSignUp', () => {
	const oAuthConfig = {
		domain: 'example.com',
		responseType: 'code' as const,
		scopes: ['openid'],
		redirectSignIn: ['https://example.com/signin'],
		redirectSignOut: ['https://example.com/signout'],
	};
	const userPoolClientId = 'userPoolClientId';
	const state = 'state';
	const origin = `https://${oAuthConfig.domain}`;
	const codeVerifier = {
		toCodeChallenge: () => 'code_challenge',
		method: 'S256' as const,
		value: 'code_verifier',
	};

	it('returns URLSearchParams with the correct values', () => {
		const url = 'https://example.com';

		const result = createUrlSearchParamsForSignInSignUp({
			url,
			oAuthConfig,
			userPoolClientId,
			state,
			origin,
			codeVerifier,
		});

		expect(result.toString()).toBe(
			'redirect_uri=https%3A%2F%2Fexample.com%2Fsignin&response_type=code&client_id=userPoolClientId&scope=openid&state=state&code_challenge=code_challenge&code_challenge_method=S256',
		);
	});

	it('returns URLSearchParams with the correct values when identity provider is resolved', () => {
		const url = 'https://example.com?provider=Google';

		const result = createUrlSearchParamsForSignInSignUp({
			url,
			oAuthConfig,
			userPoolClientId,
			state,
			origin,
			codeVerifier,
		});

		expect(result.toString()).toBe(
			'redirect_uri=https%3A%2F%2Fexample.com%2Fsignin&response_type=code&client_id=userPoolClientId&scope=openid&state=state&code_challenge=code_challenge&code_challenge_method=S256&identity_provider=Google',
		);
	});
});

describe('createUrlSearchParamsForTokenExchange', () => {
	it('returns URLSearchParams with the correct values', () => {
		const input = {
			code: 'code',
			client_id: 'client_id',
			redirect_uri: 'redirect_uri',
			code_verifier: 'code_verifier',
			grant_type: 'grant_type',
		};

		const result = createUrlSearchParamsForTokenExchange(input);

		expect(result.toString()).toBe(
			'code=code&client_id=client_id&redirect_uri=redirect_uri&code_verifier=code_verifier&grant_type=grant_type',
		);
	});
});

describe('createUrlSearchParamsForTokenRevocation', () => {
	it('returns URLSearchParams with the correct values', () => {
		const input = {
			token: 'refresh_token',
			client_id: 'client_id',
		};

		const result = createUrlSearchParamsForTokenRevocation(input);

		expect(result.toString()).toBe('token=refresh_token&client_id=client_id');
	});
});
