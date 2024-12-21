import * as cognitoHostedUIEndpoints from '../../../src/auth/utils/cognitoHostedUIEndpoints';

describe('cognitoHostedUIEndpoints', () => {
	const urlSearchParamsForCreateAuthorizeEndpoint = new URLSearchParams({
		client_id: 'mockUserPoolClientId',
		redirect_uri: 'https://example.com/api/authsign-in-callback',
		state: 'mockState',
	});
	const urlSearchParamsForCreateSignUpEndpoint =
		urlSearchParamsForCreateAuthorizeEndpoint;
	const urlSearchParamsForCreateLogoutEndpoint = new URLSearchParams({
		logout_uri: 'https://example.com/sign-in',
		client_id: 'mockUserPoolClientId',
	});

	const testCase = [
		[
			'createAuthorizeEndpoint',
			`https://id.amazoncognito.com/oauth2/authorize?${urlSearchParamsForCreateAuthorizeEndpoint.toString()}`,
			['id.amazoncognito.com', urlSearchParamsForCreateAuthorizeEndpoint],
		],
		[
			'createTokenEndpoint',
			'https://id.amazoncognito.com/oauth2/token',
			['id.amazoncognito.com'],
		],
		[
			'createRevokeEndpoint',
			'https://id.amazoncognito.com/oauth2/revoke',
			['id.amazoncognito.com'],
		],
		[
			'createSignUpEndpoint',
			`https://id.amazoncognito.com/signup?${urlSearchParamsForCreateSignUpEndpoint.toString()}`,
			['id.amazoncognito.com', urlSearchParamsForCreateSignUpEndpoint],
		],
		[
			'createLogoutEndpoint',
			`https://id.amazoncognito.com/logout?${urlSearchParamsForCreateLogoutEndpoint.toString()}`,
			['id.amazoncognito.com', urlSearchParamsForCreateLogoutEndpoint],
		],
	] as [keyof typeof cognitoHostedUIEndpoints, string, any][];

	test.each(testCase)(
		'factory %s returns expected url: %s',
		(fn, expected, args) => {
			// eslint-disable-next-line import/namespace
			expect(cognitoHostedUIEndpoints[fn].apply(null, args)).toBe(expected);
		},
	);
});
