import { SIGN_IN_TIMEOUT_ERROR } from '../../../src/auth/constant';

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
		expectedRedirect: '/sign-in?error=errorDescription',
	},
	{
		code: null,
		state: null,
		error: 'error',
		errorDescription: null,
		expectedStatus: 302,
		expectedRedirect: '/sign-in?error=error',
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
		expectedRedirect: `/sign-in?error=${SIGN_IN_TIMEOUT_ERROR}`,
	},
	{
		state: undefined,
		pkce: 'pkce',
		expectedStatus: 302,
		expectedRedirect: `/sign-in?error=${SIGN_IN_TIMEOUT_ERROR}`,
	},
	{
		state: 'state',
		pkce: undefined,
		expectedStatus: 302,
		expectedRedirect: `/sign-in?error=${SIGN_IN_TIMEOUT_ERROR}`,
	},
];
