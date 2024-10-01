// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	appendSetCookieHeadersToNextApiResponse,
	createAuthFlowProofCookiesSetOptions,
	createAuthFlowProofs,
	createAuthorizeEndpoint,
	createSignInFlowProofCookies,
	createSignUpEndpoint,
	createUrlSearchParamsForSignInSignUp,
} from '../utils';

import { HandleSignInSignUpRequestForPagesRouter } from './types';

export const handleSignInSignUpRequestForPagesRouter: HandleSignInSignUpRequestForPagesRouter =
	({
		request,
		response,
		customState,
		oAuthConfig,
		userPoolClientId,
		origin,
		setCookieOptions,
		type,
	}) => {
		const { codeVerifier, state } = createAuthFlowProofs({ customState });
		const redirectUrlSearchParams = createUrlSearchParamsForSignInSignUp({
			url: request.url!,
			oAuthConfig,
			userPoolClientId,
			state,
			origin,
			codeVerifier,
		});

		appendSetCookieHeadersToNextApiResponse(
			response,
			createSignInFlowProofCookies({ state, pkce: codeVerifier.value }),
			createAuthFlowProofCookiesSetOptions(setCookieOptions),
		);

		response.redirect(
			302,
			type === 'signIn'
				? createAuthorizeEndpoint(oAuthConfig.domain, redirectUrlSearchParams)
				: createSignUpEndpoint(oAuthConfig.domain, redirectUrlSearchParams),
		);
	};
