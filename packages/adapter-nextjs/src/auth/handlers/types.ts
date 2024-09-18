// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { OAuthConfig } from '@aws-amplify/core';
import { NextApiRequest, NextApiResponse } from 'next';
import { CookieStorage } from 'aws-amplify/adapter-core';

import { CreateAuthRoutesHandlersInput } from '../types';

interface AuthApiRequestHandlerInputBase {
	oAuthConfig: OAuthConfig;
	origin: string;
	userPoolClientId: string;
	setCookieOptions: CookieStorage.SetCookieOptions;
}

// handleSignInRequest
interface HandleSignInSignUpRequestInputBase
	extends AuthApiRequestHandlerInputBase {
	customState?: string;
	type: 'signIn' | 'signUp';
}
interface HandleSignInSignUpRequestInput
	extends HandleSignInSignUpRequestInputBase {
	request: Request;
}
interface HandleSignInSigUpRequestForPagesRouterInput
	extends HandleSignInSignUpRequestInputBase {
	request: NextApiRequest;
	response: NextApiResponse;
}
export type HandleSignInSignUpRequest = (
	input: HandleSignInSignUpRequestInput,
) => Response;
export type HandleSignInSignUpRequestForPagesRouter = (
	input: HandleSignInSigUpRequestForPagesRouterInput,
) => void;

// handleSignInCallbackRequest
interface HandleSignInCallbackRequestInput
	extends AuthApiRequestHandlerInputBase {
	request: Request;
	handlerInput: CreateAuthRoutesHandlersInput;
}
interface HandleSignInCallbackRequestForPagesRouterInput
	extends AuthApiRequestHandlerInputBase {
	request: NextApiRequest;
	response: NextApiResponse;
	handlerInput: CreateAuthRoutesHandlersInput;
}
export type HandleSignInCallbackRequest = (
	input: HandleSignInCallbackRequestInput,
) => Promise<Response>;
export type HandleSignInCallbackRequestForPagesRouter = (
	input: HandleSignInCallbackRequestForPagesRouterInput,
) => Promise<void>;

// handleSignOutRequest
type handleSignOutRequestInput = AuthApiRequestHandlerInputBase;
interface handleSignOutRequestForPagesRouterInput
	extends AuthApiRequestHandlerInputBase {
	response: NextApiResponse;
}
export type HandleSignOutRequest = (
	input: handleSignOutRequestInput,
) => Response;
export type HandleSignOutRequestForPagesRouter = (
	input: handleSignOutRequestForPagesRouterInput,
) => void;

// handleSignOutCallbackRequest
interface HandleSignOutCallbackRequestInput
	extends Omit<AuthApiRequestHandlerInputBase, 'origin'> {
	request: Request;
	handlerInput: CreateAuthRoutesHandlersInput;
}
interface HandleSignOutCallbackRequestForPagesHandlerInput
	extends Omit<AuthApiRequestHandlerInputBase, 'origin'> {
	request: NextApiRequest;
	response: NextApiResponse;
	handlerInput: CreateAuthRoutesHandlersInput;
}
export type HandleSignOutCallbackRequest = (
	input: HandleSignOutCallbackRequestInput,
) => Promise<Response>;
export type HandleSignOutCallbackRequestForPagesRouter = (
	input: HandleSignOutCallbackRequestForPagesHandlerInput,
) => Promise<void>;
