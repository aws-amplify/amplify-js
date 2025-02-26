// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HandleAuthApiRouteRequestForPagesRouter } from './types';
import {
	getRedirectOrDefault,
	hasActiveUserSessionWithPagesRouter,
	isSupportedAuthApiRoutePath,
} from './utils';
import {
	handleSignInCallbackRequestForPagesRouter,
	handleSignInSignUpRequestForPagesRouter,
	handleSignOutCallbackRequestForPagesRouter,
	handleSignOutRequestForPagesRouter,
} from './handlers';

export const handleAuthApiRouteRequestForPagesRouter: HandleAuthApiRouteRequestForPagesRouter =
	async ({
		request,
		response,
		userPoolClientId,
		oAuthConfig,
		handlerInput,
		origin,
		setCookieOptions,
		runWithAmplifyServerContext,
	}) => {
		if (request.method !== 'GET') {
			response.status(405).end();

			return;
		}

		const { slug } = request.query;
		// don't support [...slug] here
		if (slug === undefined || Array.isArray(slug)) {
			response.status(400).end();

			return;
		}

		if (!isSupportedAuthApiRoutePath(slug)) {
			response.status(404).end();

			return;
		}

		switch (slug) {
			case 'sign-up': {
				const hasActiveUserSession = await hasActiveUserSessionWithPagesRouter({
					request,
					response,
					runWithAmplifyServerContext,
				});

				if (hasActiveUserSession) {
					response.redirect(
						302,
						getRedirectOrDefault(handlerInput.redirectOnSignInComplete),
					);

					return;
				}

				handleSignInSignUpRequestForPagesRouter({
					customState: handlerInput.customState,
					oAuthConfig,
					origin,
					request,
					response,
					setCookieOptions,
					type: 'signUp',
					userPoolClientId,
				});
				break;
			}
			case 'sign-in': {
				const hasActiveUserSession = await hasActiveUserSessionWithPagesRouter({
					request,
					response,
					runWithAmplifyServerContext,
				});

				if (hasActiveUserSession) {
					response.redirect(
						302,
						getRedirectOrDefault(handlerInput.redirectOnSignInComplete),
					);

					return;
				}

				handleSignInSignUpRequestForPagesRouter({
					customState: handlerInput.customState,
					oAuthConfig,
					origin,
					request,
					response,
					setCookieOptions,
					type: 'signIn',
					userPoolClientId,
				});
				break;
			}
			case 'sign-out':
				handleSignOutRequestForPagesRouter({
					oAuthConfig,
					origin,
					response,
					setCookieOptions,
					userPoolClientId,
				});
				break;
			case 'sign-in-callback':
				// In pages router the response is sent via calling `response.end()` or
				// `response.send()`. The response is not returned from the handler.
				// To ensure these two methods are called before the handler returns,
				// we use `await` here.
				await handleSignInCallbackRequestForPagesRouter({
					handlerInput,
					oAuthConfig,
					origin,
					request,
					response,
					setCookieOptions,
					userPoolClientId,
				});
				break;
			case 'sign-out-callback':
				// In pages router the response is sent via calling `response.end()` or
				// `response.send()`. The response is not returned from the handler.
				// To ensure these two methods are called before the handler returns,
				// we use `await` here.
				await handleSignOutCallbackRequestForPagesRouter({
					handlerInput,
					oAuthConfig,
					origin,
					request,
					response,
					setCookieOptions,
					userPoolClientId,
				});
				break;
			// default:
			// is unreachable by the guard of isSupportedAuthApiRoutePath()
		}
	};
