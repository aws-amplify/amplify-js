// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NextRequest } from 'next/server';
import {
	AmplifyServerContextError,
	CookieStorage,
	OAuthConfig,
	assertOAuthConfig,
	assertTokenProviderConfig,
} from 'aws-amplify/adapter-core/internals';
import { NextApiRequest, NextApiResponse } from 'next';

import {
	AuthRoutesHandlerContext,
	CreateAuthRouteHandlersFactoryInput,
	CreateAuthRoutesHandlersInput,
	InternalCreateAuthRouteHandlers,
} from './types';
import {
	isAuthRoutesHandlersContext,
	isNextApiRequest,
	isNextApiResponse,
	isNextRequest,
	isValidOrigin,
} from './utils';
import { handleAuthApiRouteRequestForAppRouter } from './handleAuthApiRouteRequestForAppRouter';
import { handleAuthApiRouteRequestForPagesRouter } from './handleAuthApiRouteRequestForPagesRouter';

export const createAuthRouteHandlersFactory = ({
	config: resourcesConfig,
	amplifyAppOrigin,
	runWithAmplifyServerContext,
	globalSettings,
}: CreateAuthRouteHandlersFactoryInput): InternalCreateAuthRouteHandlers => {
	const handleRequest = async ({
		request,
		contextOrResponse,
		handlerInput,
		userPoolClientId,
		oAuthConfig,
		setCookieOptions,
		origin,
	}: {
		request: NextRequest | NextApiRequest;
		contextOrResponse: AuthRoutesHandlerContext | NextApiResponse;
		handlerInput: CreateAuthRoutesHandlersInput;
		userPoolClientId: string;
		oAuthConfig: OAuthConfig;
		setCookieOptions: CookieStorage.SetCookieOptions;
		origin: string;
	}): Promise<Response | undefined> => {
		if (isNextApiRequest(request) && isNextApiResponse(contextOrResponse)) {
			// In pages router the response is sent via calling `response.end()` or
			// `response.send()`. The response is not returned from the handler.
			// To ensure these two methods are called before the handler returns,
			// we use `await` here.
			await handleAuthApiRouteRequestForPagesRouter({
				request,
				response: contextOrResponse,
				handlerInput,
				userPoolClientId,
				oAuthConfig,
				setCookieOptions,
				origin,
				runWithAmplifyServerContext,
			});

			// In the Pages Router, the final response is handled by contextOrResponse
			return;
		}

		if (
			isNextRequest(request) &&
			isAuthRoutesHandlersContext(contextOrResponse)
		) {
			// In the App Router, the final response is constructed and returned
			return handleAuthApiRouteRequestForAppRouter({
				request,
				handlerContext: contextOrResponse,
				handlerInput,
				userPoolClientId,
				oAuthConfig,
				setCookieOptions,
				origin,
				runWithAmplifyServerContext,
			});
		}

		// this should not be happening
		throw new Error(
			'Invalid request and context/response combination. The request cannot be handled.',
		);
	};

	return (createAuthRoutesHandlersInput = {}) => {
		// origin validation should happen when createAuthRouteHandlers is being called to create
		// Auth API routes.
		if (!amplifyAppOrigin) {
			throw new AmplifyServerContextError({
				message: 'Could not find the AMPLIFY_APP_ORIGIN environment variable.',
				recoverySuggestion:
					'Add the AMPLIFY_APP_ORIGIN environment variable to the `.env` file of your Next.js project.',
			});
		}

		if (!isValidOrigin(amplifyAppOrigin)) {
			throw new AmplifyServerContextError({
				message:
					'AMPLIFY_APP_ORIGIN environment variable contains an invalid origin string.',
				recoverySuggestion:
					'Ensure the AMPLIFY_APP_ORIGIN environment variable is a valid origin string.',
			});
		}

		// OAuth config validation should happen when createAuthRouteHandlers is being called to create
		// Auth API routes.
		assertTokenProviderConfig(resourcesConfig.Auth?.Cognito);
		assertOAuthConfig(resourcesConfig.Auth.Cognito);

		const { userPoolClientId } = resourcesConfig.Auth.Cognito;
		const { oauth: oAuthConfig } = resourcesConfig.Auth.Cognito.loginWith;
		const setCookieOptions = globalSettings.getRuntimeOptions().cookies ?? {};

		// The call-site of this returned function is the Next.js API route file
		return (request, contextOrResponse) =>
			handleRequest({
				request,
				contextOrResponse,
				handlerInput: createAuthRoutesHandlersInput,
				userPoolClientId,
				oAuthConfig,
				setCookieOptions,
				origin: amplifyAppOrigin,
			});
	};
};
