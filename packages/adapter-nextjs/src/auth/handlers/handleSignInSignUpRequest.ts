// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	appendSetCookieHeaders,
	createAuthFlowProofCookiesSetOptions,
	createAuthFlowProofs,
	createAuthorizeEndpoint,
	createSignInFlowProofCookies,
	createSignUpEndpoint,
	createUrlSearchParamsForSignInSignUp,
	isNonSSLOrigin,
} from '../utils';

import { HandleSignInSignUpRequest } from './types';

export const handleSignInSignUpRequest: HandleSignInSignUpRequest = ({
	request,
	userPoolClientId,
	oAuthConfig,
	customState,
	origin,
	setCookieOptions,
	type,
}) => {
	const { codeVerifier, state } = createAuthFlowProofs({ customState });
	const redirectUrlSearchParams = createUrlSearchParamsForSignInSignUp({
		url: request.url,
		oAuthConfig,
		userPoolClientId,
		state,
		origin,
		codeVerifier,
	});

	const headers = new Headers();
	headers.set(
		'Location',
		type === 'signIn'
			? createAuthorizeEndpoint(oAuthConfig.domain, redirectUrlSearchParams)
			: createSignUpEndpoint(oAuthConfig.domain, redirectUrlSearchParams),
	);

	appendSetCookieHeaders(
		headers,
		createSignInFlowProofCookies({ state, pkce: codeVerifier.value }),
		createAuthFlowProofCookiesSetOptions(setCookieOptions, {
			secure: isNonSSLOrigin(origin),
		}),
	);

	return new Response(null, {
		status: 302,
		headers,
	});
};
