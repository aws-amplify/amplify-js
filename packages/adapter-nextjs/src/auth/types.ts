// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig } from 'aws-amplify';
import { NextRequest } from 'next/server';
import { NextApiRequest, NextApiResponse } from 'next';
import { OAuthConfig } from '@aws-amplify/core';
import { CookieStorage } from 'aws-amplify/adapter-core';

import { NextServer } from '../types';

export type SupportedRoutePaths =
	| 'sign-in'
	| 'sign-up'
	| 'sign-in-callback'
	| 'sign-out'
	| 'sign-out-callback';

/**
 * The Auth API routes can be handled by the {@link AuthRouteHandlers}.
 */
export interface AuthRouteHandlerParams {
	slug: string | string[] | undefined;
}

export interface AuthRoutesHandlerContext {
	params: AuthRouteHandlerParams;
}

/**
 * The handler function for handling the GET requests sent to the Auth API routes.
 * Only `GET` method gets handled, otherwise it rejects.
 *
 * @param request - `request` can be he following:
 *   1. a `NextRequest` when the handler is used in the App Router of Next.js
 *   2. a `NextApiRequest` when the handler is used in the Pages Router of Next.js
 * @param contextOrRequest - `contextOrRequest` can be the following:
 *   1. a {@link AuthRoutesHandlerContext} when the handler is used in the App
 *      Router of Next.js
 *   2. a `NextApiResponse` when the handler is used in the Pages Router of Next.js
 *
 * @returns a `Promise` of `Response` when used in the App Router of Next.js, or
 *   returns `undefined` when used in the Pages Router of Next.js.
 */
export type AuthRouteHandlers = (
	request: NextRequest | NextApiRequest,
	contextOrRequest: AuthRoutesHandlerContext | NextApiResponse,
) => // Next.js API route handler is required to be an async function.
Promise<Response | undefined>;

export interface CreateAuthRoutesHandlersInput {
	/**
	 * The customer's custom state added as the redirect URL query parameter
	 * for preventing CSRF attacks
	 */
	customState?: string;
	/**
	 * The app route redirect to when a sign-in flow completes. Defaults o the
	 * root of the app if not provided.
	 */
	redirectOnSignInComplete?: string;
	/**
	 * The app route redirect to when a sign-out flow completes. Defaults o the
	 * root of the app if not provided.
	 */
	redirectOnSignOutComplete?: string;
}

export type CreateAuthRouteHandlers = (
	input?: CreateAuthRoutesHandlersInput,
) => AuthRouteHandlers;

export interface CreateAuthRouteHandlersFactoryInput {
	config: ResourcesConfig;
	runtimeOptions: NextServer.CreateServerRunnerRuntimeOptions | undefined;
	runWithAmplifyServerContext: NextServer.RunOperationWithContext;
}

export type CreateOAuthRouteHandlersFactory = (
	input: CreateAuthRouteHandlersFactoryInput,
) => CreateAuthRouteHandlers;

interface HandleAuthApiRouteRequestInputBase {
	handlerInput: CreateAuthRoutesHandlersInput;
	userPoolClientId: string;
	oAuthConfig: OAuthConfig;
	setCookieOptions: CookieStorage.SetCookieOptions;
	origin: string;
}

interface HandleAuthApiRouteRequestForAppRouterInput
	extends HandleAuthApiRouteRequestInputBase {
	request: NextRequest;
	handlerContext: AuthRoutesHandlerContext;
	runWithAmplifyServerContext: NextServer.RunOperationWithContext;
}

interface HandleAuthApiRouteRequestForPagesRouterInput
	extends HandleAuthApiRouteRequestInputBase {
	request: NextApiRequest;
	response: NextApiResponse;
	runWithAmplifyServerContext: NextServer.RunOperationWithContext;
}

export type HandleAuthApiRouteRequestForAppRouter = (
	input: HandleAuthApiRouteRequestForAppRouterInput,
) => Promise<Response>;

export type HandleAuthApiRouteRequestForPagesRouter = (
	input: HandleAuthApiRouteRequestForPagesRouterInput,
) => Promise<void>;

export interface OAuthTokenResponsePayload {
	access_token: string;
	id_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
}

interface OAuthTokenResponseErrorPayload {
	error: string;
}

export type OAuthTokenExchangeResult =
	| OAuthTokenResponsePayload
	| OAuthTokenResponseErrorPayload;

export interface OAuthTokenRevocationResult {
	error?: string;
}
