// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HandleAuthApiRouteRequestForPagesRouter } from './types';
import {
	hasUserSignedInWithPagesRouter,
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
				const hasUserSignedIn = await hasUserSignedInWithPagesRouter({
					request,
					response,
					runWithAmplifyServerContext,
				});

				if (hasUserSignedIn) {
					response.redirect(302, handlerInput.redirectOnSignInComplete ?? '/');

					return;
				}

				handleSignInSignUpRequestForPagesRouter({
					request,
					response,
					userPoolClientId,
					oAuthConfig,
					customState: handlerInput.customState,
					origin,
					setCookieOptions,
					type: 'signUp',
				});
				break;
			}
			case 'sign-in': {
				const hasUserSignedIn = await hasUserSignedInWithPagesRouter({
					request,
					response,
					runWithAmplifyServerContext,
				});

				if (hasUserSignedIn) {
					response.redirect(302, handlerInput.redirectOnSignInComplete ?? '/');

					return;
				}

				handleSignInSignUpRequestForPagesRouter({
					request,
					response,
					userPoolClientId,
					oAuthConfig,
					customState: handlerInput.customState,
					origin,
					setCookieOptions,
					type: 'signIn',
				});
				break;
			}
			case 'sign-out':
				handleSignOutRequestForPagesRouter({
					response,
					userPoolClientId,
					oAuthConfig,
					origin,
					setCookieOptions,
				});
				break;
			case 'sign-in-callback':
				// In pages router the response is sent via calling `response.end()` or
				// `response.send()`. The response is not returned from the handler.
				// To ensure these two methods are called before the handler returns,
				// we use `await` here.
				await handleSignInCallbackRequestForPagesRouter({
					request,
					response,
					handlerInput,
					userPoolClientId,
					oAuthConfig,
					origin,
					setCookieOptions,
				});
				break;
			case 'sign-out-callback':
				// In pages router the response is sent via calling `response.end()` or
				// `response.send()`. The response is not returned from the handler.
				// To ensure these two methods are called before the handler returns,
				// we use `await` here.
				await handleSignOutCallbackRequestForPagesRouter({
					request,
					response,
					handlerInput,
					oAuthConfig,
					userPoolClientId,
					setCookieOptions,
				});
				break;
			// default:
			// is unreachable by the guard of isSupportedAuthApiRoutePath()
		}
	};
