// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	appendSetCookieHeadersToNextApiResponse,
	createAuthFlowProofCookiesSetOptions,
	createLogoutEndpoint,
	createSignOutFlowProofCookies,
	isNonSSLOrigin,
	resolveRedirectSignOutUrl,
} from '../utils';

import { HandleSignOutRequestForPagesRouter } from './types';

export const handleSignOutRequestForPagesRouter: HandleSignOutRequestForPagesRouter =
	({ response, oAuthConfig, userPoolClientId, origin, setCookieOptions }) => {
		const urlSearchParams = new URLSearchParams({
			client_id: userPoolClientId,
			logout_uri: resolveRedirectSignOutUrl(origin, oAuthConfig),
		});

		appendSetCookieHeadersToNextApiResponse(
			response,
			createSignOutFlowProofCookies(),
			createAuthFlowProofCookiesSetOptions(setCookieOptions, {
				secure: isNonSSLOrigin(origin),
			}),
		);

		response.redirect(
			302,
			createLogoutEndpoint(oAuthConfig.domain, urlSearchParams).toString(),
		);
	};
