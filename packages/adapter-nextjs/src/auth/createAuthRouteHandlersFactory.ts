// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NextRequest } from 'next/server';
import {
	assertOAuthConfig,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { AmplifyServerContextError } from '@aws-amplify/core/internals/adapter-core';

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
} from './utils';
import { handleAuthApiRouteRequestForAppRouter } from './handleAuthApiRouteRequestForAppRouter';
import { handleAuthApiRouteRequestForPagesRouter } from './handleAuthApiRouteRequestForPagesRouter';

export const createAuthRouteHandlersFactory = ({
	config: resourcesConfig,
	runtimeOptions = {},
	runWithAmplifyServerContext,
}: CreateAuthRouteHandlersFactoryInput): InternalCreateAuthRouteHandlers => {
	const origin = process.env.AMPLIFY_APP_ORIGIN;
	if (!origin)
		throw new AmplifyServerContextError({
			message: 'Could not find the AMPLIFY_APP_ORIGIN environment variable.',
			recoverySuggestion:
				'Add the AMPLIFY_APP_ORIGIN environment variable to the `.env` file of your Next.js project.',
		});

	assertTokenProviderConfig(resourcesConfig.Auth?.Cognito);
	assertOAuthConfig(resourcesConfig.Auth.Cognito);

	const {
		Cognito: {
			userPoolClientId,
			loginWith: { oauth: oAuthConfig },
		},
	} = resourcesConfig.Auth;
	const { cookies: setCookieOptions = {} } = runtimeOptions;

	const handleRequest = async (
		request: NextRequest | NextApiRequest,
		contextOrResponse: AuthRoutesHandlerContext | NextApiResponse,
		handlerInput: CreateAuthRoutesHandlersInput,
	): Promise<Response | undefined> => {
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

	return (createAuthRoutesHandlersInput = {}) =>
		// The call-site of this returned function is the Next.js API route file
		(request, contextOrRequest) =>
			handleRequest(request, contextOrRequest, createAuthRoutesHandlersInput);
};
