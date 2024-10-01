import { ResourcesConfig } from 'aws-amplify';
import {
	assertOAuthConfig,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import { createAuthRouteHandlersFactory } from '../../src/auth/createAuthRouteHandlersFactory';
import { handleAuthApiRouteRequestForAppRouter } from '../../src/auth/handleAuthApiRouteRequestForAppRouter';
import { handleAuthApiRouteRequestForPagesRouter } from '../../src/auth/handleAuthApiRouteRequestForPagesRouter';
import { NextServer } from '../../src';
import {
	AuthRouteHandlers,
	CreateAuthRoutesHandlersInput,
} from '../../src/auth/types';
import {
	isAuthRoutesHandlersContext,
	isNextApiRequest,
	isNextApiResponse,
	isNextRequest,
} from '../../src/auth/utils';

jest.mock('@aws-amplify/core/internals/utils');
jest.mock('../../src/auth/handleAuthApiRouteRequestForAppRouter');
jest.mock('../../src/auth/handleAuthApiRouteRequestForPagesRouter');
jest.mock('../../src/auth/utils');

const mockAmplifyConfig: ResourcesConfig = {
	Auth: {
		Cognito: {
			identityPoolId: '123',
			userPoolId: 'abc',
			userPoolClientId: 'def',
			loginWith: {
				oauth: {
					domain: 'example.com',
					responseType: 'code',
					redirectSignIn: ['https://example.com/signin'],
					redirectSignOut: ['https://example.com/signout'],
					scopes: ['openid', 'email'],
				},
			},
		},
	},
};

const mockRuntimeOptions: NextServer.CreateServerRunnerRuntimeOptions = {
	cookies: {
		sameSite: 'strict',
	},
};
const mockAssertTokenProviderConfig = jest.mocked(assertTokenProviderConfig);
const mockAssertOAuthConfig = jest.mocked(assertOAuthConfig);
const mockHandleAuthApiRouteRequestForAppRouter = jest.mocked(
	handleAuthApiRouteRequestForAppRouter,
);
const mockHandleAuthApiRouteRequestForPagesRouter = jest.mocked(
	handleAuthApiRouteRequestForPagesRouter,
);
const mockIsNextApiRequest = jest.mocked(isNextApiRequest);
const mockIsNextApiResponse = jest.mocked(isNextApiResponse);
const mockIsNextRequest = jest.mocked(isNextRequest);
const mockIsAuthRoutesHandlersContext = jest.mocked(
	isAuthRoutesHandlersContext,
);
const mockRunWithAmplifyServerContext =
	jest.fn() as jest.MockedFunction<NextServer.RunOperationWithContext>;

describe('createAuthRoutesHandlersFactory', () => {
	const existingProcessEnvVars = { ...process.env };
	const modifiedProcessEnvVars = {
		...process.env,
		AMPLIFY_APP_ORIGIN: 'https://example.com',
	};

	beforeEach(() => {
		process.env = modifiedProcessEnvVars;
	});

	afterEach(() => {
		process.env = existingProcessEnvVars;
	});

	it('throws an error if the AMPLIFY_APP_ORIGIN environment variable is not set', () => {
		process.env = { ...existingProcessEnvVars, AMPLIFY_APP_ORIGIN: undefined };
		expect(() =>
			createAuthRouteHandlersFactory({
				config: mockAmplifyConfig,
				runtimeOptions: mockRuntimeOptions,
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
			}),
		).toThrow('Could not find the AMPLIFY_APP_ORIGIN environment variable.');
	});

	it('calls config assertion functions to validate the Auth configuration', () => {
		createAuthRouteHandlersFactory({
			config: mockAmplifyConfig,
			runtimeOptions: mockRuntimeOptions,
			runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
		});

		expect(mockAssertTokenProviderConfig).toHaveBeenCalledWith(
			mockAmplifyConfig.Auth?.Cognito,
		);
		expect(mockAssertOAuthConfig).toHaveBeenCalledWith(
			mockAmplifyConfig.Auth!.Cognito,
		);
	});

	describe('the created route handler function', () => {
		const testCreateAuthRoutesHandlersFactoryInput = {
			config: mockAmplifyConfig,
			runtimeOptions: mockRuntimeOptions,
			runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
		};
		const testCreateAuthRoutesHandlersInput: CreateAuthRoutesHandlersInput = {
			customState: 'random-state',
			redirectOnSignInComplete: '/home',
			redirectOnSignOutComplete: '/login',
		};
		let handler: AuthRouteHandlers;

		beforeAll(() => {
			process.env = modifiedProcessEnvVars;
			const createAuthRoutesHandlers = createAuthRouteHandlersFactory(
				testCreateAuthRoutesHandlersFactoryInput,
			);
			handler = createAuthRoutesHandlers(testCreateAuthRoutesHandlersInput);
		});

		afterAll(() => {
			process.env = existingProcessEnvVars;
		});

		afterEach(() => {
			mockIsAuthRoutesHandlersContext.mockReset();
			mockIsNextApiRequest.mockReset();
			mockIsNextApiResponse.mockReset();
			mockIsNextRequest.mockReset();
		});

		it('calls handleAuthApiRouteRequestForPagesRouter when 1st param is a NextApiRequest and 2nd param is a NextApiResponse', async () => {
			const param1 = {} as any;
			const param2 = {} as any;
			mockIsNextApiRequest.mockReturnValueOnce(true);
			mockIsNextApiResponse.mockReturnValueOnce(true);
			mockIsNextRequest.mockReturnValueOnce(false);
			mockIsAuthRoutesHandlersContext.mockReturnValueOnce(false);

			await handler(param1, param2);

			expect(mockHandleAuthApiRouteRequestForPagesRouter).toHaveBeenCalledWith({
				request: param1,
				response: param2,
				handlerInput: testCreateAuthRoutesHandlersInput,
				oAuthConfig: mockAmplifyConfig.Auth!.Cognito!.loginWith!.oauth,
				setCookieOptions: mockRuntimeOptions.cookies,
				origin: 'https://example.com',
				userPoolClientId: 'def',
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
			});
		});

		it('calls handleAuthApiRouteRequestForAppRouter when 1st param is a NextRequest and the 2nd param is a AuthRoutesHandlersContext', async () => {
			const request = {} as any;
			const context = {} as any;
			mockIsNextApiRequest.mockReturnValueOnce(false);
			mockIsNextApiResponse.mockReturnValueOnce(false);
			mockIsNextRequest.mockReturnValueOnce(true);
			mockIsAuthRoutesHandlersContext.mockReturnValueOnce(true);

			await handler(request, context);

			expect(mockHandleAuthApiRouteRequestForAppRouter).toHaveBeenCalledWith({
				request,
				handlerContext: context,
				handlerInput: testCreateAuthRoutesHandlersInput,
				oAuthConfig: mockAmplifyConfig.Auth!.Cognito!.loginWith!.oauth,
				setCookieOptions: mockRuntimeOptions.cookies,
				origin: 'https://example.com',
				userPoolClientId: 'def',
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
			});
		});

		it('throws an error when the request and context/response combination is invalid', () => {
			const request = {} as any;
			const context = {} as any;
			mockIsNextApiRequest.mockReturnValueOnce(false);
			mockIsNextApiResponse.mockReturnValueOnce(false);
			mockIsNextRequest.mockReturnValueOnce(false);
			mockIsAuthRoutesHandlersContext.mockReturnValueOnce(false);

			expect(handler(request, context)).rejects.toThrow(
				'Invalid request and context/response combination. The request cannot be handled.',
			);
		});

		it('uses default values for parameters that have values as undefined', async () => {
			const createAuthRoutesHandlers = createAuthRouteHandlersFactory({
				config: mockAmplifyConfig,
				runtimeOptions: undefined,
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
			});
			const handlerWithDefaultParamValues =
				createAuthRoutesHandlers(/* undefined */);

			const request = {} as any;
			const response = {} as any;

			mockIsNextApiRequest.mockReturnValueOnce(true);
			mockIsNextApiResponse.mockReturnValueOnce(true);
			mockIsNextRequest.mockReturnValueOnce(false);
			mockIsAuthRoutesHandlersContext.mockReturnValueOnce(false);

			await handlerWithDefaultParamValues(request, response);

			expect(handleAuthApiRouteRequestForPagesRouter).toHaveBeenCalledWith({
				request,
				response,
				handlerInput: {},
				oAuthConfig: mockAmplifyConfig.Auth!.Cognito!.loginWith!.oauth,
				setCookieOptions: {},
				origin: 'https://example.com',
				userPoolClientId: 'def',
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
			});
		});
	});
});
