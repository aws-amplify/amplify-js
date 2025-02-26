// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HandleAuthApiRouteRequestForAppRouter } from './types';
import {
	getRedirectOrDefault,
	hasActiveUserSessionWithAppRouter,
	isSupportedAuthApiRoutePath,
} from './utils';
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
		runWithAmplifyServerContext,
	}) => {
		if (request.method !== 'GET') {
			return new Response(null, { status: 405 });
		}

		const { slug } = await handlerContext.params;
		// don't support [...slug] here
		if (slug === undefined || Array.isArray(slug)) {
			return new Response(null, { status: 400 });
		}

		if (!isSupportedAuthApiRoutePath(slug)) {
			return new Response(null, { status: 404 });
		}

		switch (slug) {
			case 'sign-up': {
				const hasActiveUserSession = await hasActiveUserSessionWithAppRouter({
					request,
					runWithAmplifyServerContext,
				});

				if (hasActiveUserSession) {
					return new Response(null, {
						status: 302,
						headers: new Headers({
							Location: getRedirectOrDefault(
								handlerInput.redirectOnSignInComplete,
							),
						}),
					});
				}

				return handleSignInSignUpRequest({
					customState: handlerInput.customState,
					oAuthConfig,
					origin,
					request,
					setCookieOptions,
					type: 'signUp',
					userPoolClientId,
				});
			}
			case 'sign-in': {
				const hasActiveUserSession = await hasActiveUserSessionWithAppRouter({
					request,
					runWithAmplifyServerContext,
				});

				if (hasActiveUserSession) {
					return new Response(null, {
						status: 302,
						headers: new Headers({
							Location: getRedirectOrDefault(
								handlerInput.redirectOnSignInComplete,
							),
						}),
					});
				}

				return handleSignInSignUpRequest({
					customState: handlerInput.customState,
					oAuthConfig,
					origin,
					request,
					setCookieOptions,
					type: 'signIn',
					userPoolClientId,
				});
			}
			case 'sign-out':
				return handleSignOutRequest({
					oAuthConfig,
					origin,
					setCookieOptions,
					userPoolClientId,
				});
			case 'sign-in-callback':
				return handleSignInCallbackRequest({
					handlerInput,
					oAuthConfig,
					origin,
					request,
					setCookieOptions,
					userPoolClientId,
				});
			case 'sign-out-callback':
				return handleSignOutCallbackRequest({
					handlerInput,
					oAuthConfig,
					origin,
					request,
					setCookieOptions,
					userPoolClientId,
				});
			// default:
			// is unreachable by the guard of isSupportedAuthApiRoutePath()
		}
	};
