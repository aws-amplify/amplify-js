export const ERROR_URL_PARAMS_COMBINATIONS = [
	{
		code: null,
		state: 'state',
		error: null,
		errorDescription: null,
		expectedStatus: 400,
	},
	{
		code: 'code',
		state: null,
		error: null,
		errorDescription: null,
		expectedStatus: 400,
	},
	{
		code: null,
		state: null,
		error: null,
		errorDescription: 'errorDescription',
		expectedStatus: 302,
		expectedRedirect: '/sign-in?hasErrorDescription',
	},
	{
		code: null,
		state: null,
		error: 'error',
		errorDescription: null,
		expectedStatus: 302,
		expectedRedirect: '/sign-in?hasError',
	},
	{
		code: null,
		state: null,
		error: 'error',
		errorDescription: 'errorDescription',
		expectedStatus: 302,
		expectedRedirect: '/sign-in?hasErrorAndErrorDescription',
	},
];

export const ERROR_CLIENT_COOKIE_COMBINATIONS = [
	{
		state: 'state_a',
		pkce: 'pkce',
		expectedStatus: 400,
	},
	{
		state: undefined,
		pkce: undefined,
		expectedStatus: 302,
		expectedRedirect: '/sign-in?hasErrorAndErrorDescription',
	},
	{
		state: undefined,
		pkce: 'pkce',
		expectedStatus: 302,
		expectedRedirect: '/sign-in?hasErrorAndErrorDescription',
	},
	{
		state: 'state',
		pkce: undefined,
		expectedStatus: 302,
		expectedRedirect: '/sign-in?hasErrorAndErrorDescription',
	},
];
