// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HandleAuthApiRouteRequestForAppRouter } from './types';
import { isSupportedAuthApiRoutePath } from './utils';
import {
	handleSignInCallbackRequest,
	handleSignInSignUpRequest,
	handleSignOutCallbackRequest,
	handleSignOutRequest,
} from './handlers';

export const handleAuthApiRouteRequestForAppRouter: HandleAuthApiRouteRequestForAppRouter =
	async ({
		request,
		handlerContext,
		handlerInput,
		userPoolClientId,
		oAuthConfig,
		origin,
		setCookieOptions,
	}) => {
		if (request.method !== 'GET') {
			return new Response(null, { status: 405 });
		}

		const { slug } = handlerContext.params;
		// don't support [...slug] here
		if (slug === undefined || Array.isArray(slug)) {
			return new Response(null, { status: 400 });
		}

		if (!isSupportedAuthApiRoutePath(slug)) {
			return new Response(null, { status: 404 });
		}

		switch (slug) {
			case 'sign-up':
				return handleSignInSignUpRequest({
					request,
					userPoolClientId,
					oAuthConfig,
					customState: handlerInput.customState,
					origin,
					setCookieOptions,
					type: 'signUp',
				});
			case 'sign-in':
				return handleSignInSignUpRequest({
					request,
					userPoolClientId,
					oAuthConfig,
					customState: handlerInput.customState,
					origin,
					setCookieOptions,
					type: 'signIn',
				});
			case 'sign-out':
				return handleSignOutRequest({
					userPoolClientId,
					oAuthConfig,
					origin,
					setCookieOptions,
				});
			case 'sign-in-callback':
				return handleSignInCallbackRequest({
					request,
					handlerInput,
					oAuthConfig,
					origin,
					setCookieOptions,
					userPoolClientId,
				});
			case 'sign-out-callback':
				return handleSignOutCallbackRequest({
					request,
					handlerInput,
					oAuthConfig,
					userPoolClientId,
					setCookieOptions,
				});
			// default:
			// is unreachable by the guard of isSupportedAuthApiRoutePath()
		}
	};
