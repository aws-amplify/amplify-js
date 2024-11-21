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
	CreateAuthRouteHandlers,
	CreateAuthRouteHandlersFactoryInput,
	CreateAuthRoutesHandlersInput,
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
}: CreateAuthRouteHandlersFactoryInput): CreateAuthRouteHandlers => {
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
			loginWith: { oauth: oAuthConfig },
		},
	} = resourcesConfig.Auth;
	const { cookies: setCookieOptions = {} } = runtimeOptions;

	const handleRequest = async (
		request: NextRequest | NextApiRequest,
		contextOrResponse: AuthRoutesHandlerContext | NextApiResponse,
		handlerInput: CreateAuthRoutesHandlersInput,
	) => {
		if (isNextApiRequest(request) && isNextApiResponse(contextOrResponse)) {
			handleAuthApiRouteRequestForPagesRouter({
				request,
				response: contextOrResponse,
				handlerInput,
				oAuthConfig,
				setCookieOptions,
				origin,
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
				oAuthConfig,
				setCookieOptions,
				origin,
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
