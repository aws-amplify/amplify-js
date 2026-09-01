import { ResourcesConfig } from 'aws-amplify';
import {
	assertOAuthConfig,
	assertTokenProviderConfig,
} from 'aws-amplify/adapter-core/internals';

import { createAuthRouteHandlersFactory } from '../../src/auth/createAuthRouteHandlersFactory';
import { handleAuthApiRouteRequestForAppRouter } from '../../src/auth/handleAuthApiRouteRequestForAppRouter';
import { handleAuthApiRouteRequestForPagesRouter } from '../../src/auth/handleAuthApiRouteRequestForPagesRouter';
import { NextServer } from '../../src';
import {
	AuthRouteHandlers,
	CreateAuthRouteHandlersFactoryInput,
	CreateAuthRoutesHandlersInput,
} from '../../src/auth/types';
import {
	isAuthRoutesHandlersContext,
	isNextApiRequest,
	isNextApiResponse,
	isNextRequest,
	isValidOrigin,
} from '../../src/auth/utils';
import { globalSettings } from '../../src/utils';

jest.mock('aws-amplify/adapter-core/internals', () => ({
	...jest.requireActual('aws-amplify/adapter-core/internals'),
	assertOAuthConfig: jest.fn(),
	assertTokenProviderConfig: jest.fn(),
}));
jest.mock('../../src/auth/handleAuthApiRouteRequestForAppRouter');
jest.mock('../../src/auth/handleAuthApiRouteRequestForPagesRouter');
jest.mock('../../src/auth/utils');
jest.mock('../../src/utils', () => ({
	globalSettings: {
		isServerSideAuthEnabled: jest.fn(() => true),
		enableServerSideAuth: jest.fn(),
		setRuntimeOptions: jest.fn(),
		getRuntimeOptions: jest.fn(() => ({
			cookies: {
				sameSite: 'strict',
			},
		})),
		isSSLOrigin: jest.fn(() => true),
		setIsSSLOrigin: jest.fn(),
	},
}));

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
const mockIsValidOrigin = jest.mocked(isValidOrigin);
const mockRunWithAmplifyServerContext =
	jest.fn() as jest.MockedFunction<NextServer.RunOperationWithContext>;

describe('createAuthRoutesHandlersFactory', () => {
	const AMPLIFY_APP_ORIGIN = 'https://example.com';

	beforeAll(() => {
		mockIsValidOrigin.mockReturnValue(true);
	});

	describe('the created createAuthRouteHandlers function', () => {
		it('throws an error if the AMPLIFY_APP_ORIGIN environment variable is not defined', () => {
			const throwingFunc = createAuthRouteHandlersFactory({
				config: mockAmplifyConfig,
				amplifyAppOrigin: undefined,
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
				globalSettings,
			});
			expect(() => throwingFunc()).toThrow(
				'Could not find the AMPLIFY_APP_ORIGIN environment variable.',
			);
		});

		it('throws an error if the AMPLIFY_APP_ORIGIN environment variable is invalid', () => {
			mockIsValidOrigin.mockReturnValueOnce(false);
			const throwingFunc = createAuthRouteHandlersFactory({
				config: mockAmplifyConfig,
				amplifyAppOrigin: 'domain-without-protocol.com',
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
				globalSettings,
			});
			expect(() => throwingFunc()).toThrow(
				'AMPLIFY_APP_ORIGIN environment variable contains an invalid origin string.',
			);
		});

		it('calls config assertion functions to validate the Auth configuration', () => {
			const func = createAuthRouteHandlersFactory({
				config: mockAmplifyConfig,
				amplifyAppOrigin: AMPLIFY_APP_ORIGIN,
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
				globalSettings,
			});

			func();

			expect(mockAssertTokenProviderConfig).toHaveBeenCalledWith(
				mockAmplifyConfig.Auth?.Cognito,
			);
			expect(mockAssertOAuthConfig).toHaveBeenCalledWith(
				mockAmplifyConfig.Auth!.Cognito,
			);
		});
	});

	describe('the created route handler function', () => {
		const testCreateAuthRoutesHandlersFactoryInput: CreateAuthRouteHandlersFactoryInput =
			{
				config: mockAmplifyConfig,
				amplifyAppOrigin: AMPLIFY_APP_ORIGIN,
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
				globalSettings,
			};
		const testCreateAuthRoutesHandlersInput: CreateAuthRoutesHandlersInput = {
			customState: 'random-state',
			redirectOnSignInComplete: '/home',
			redirectOnSignOutComplete: '/login',
		};
		let handler: AuthRouteHandlers;

		beforeAll(() => {
			const createAuthRoutesHandlers = createAuthRouteHandlersFactory(
				testCreateAuthRoutesHandlersFactoryInput,
			);
			handler = createAuthRoutesHandlers(testCreateAuthRoutesHandlersInput);
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
				setCookieOptions: {
					sameSite: 'strict',
				},
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
				setCookieOptions: {
					sameSite: 'strict',
				},
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
			(globalSettings.getRuntimeOptions as jest.Mock).mockReturnValueOnce({});
			const createAuthRoutesHandlers = createAuthRouteHandlersFactory({
				config: mockAmplifyConfig,
				amplifyAppOrigin: AMPLIFY_APP_ORIGIN,
				runWithAmplifyServerContext: mockRunWithAmplifyServerContext,
				globalSettings,
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
