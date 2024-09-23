// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	appendSetCookieHeaders,
	createAuthFlowProofCookiesSetOptions,
	createLogoutEndpoint,
	createSignOutFlowProofCookies,
	isNonSSLOrigin,
	resolveRedirectSignOutUrl,
} from '../utils';

import { HandleSignOutRequest } from './types';

export const handleSignOutRequest: HandleSignOutRequest = ({
	oAuthConfig,
	userPoolClientId,
	origin,
	setCookieOptions,
}) => {
	const urlSearchParams = new URLSearchParams({
		client_id: userPoolClientId,
		logout_uri: resolveRedirectSignOutUrl(origin, oAuthConfig),
	});

	const headers = new Headers();
	headers.set(
		'Location',
		createLogoutEndpoint(oAuthConfig.domain, urlSearchParams),
	);
	appendSetCookieHeaders(
		headers,
		createSignOutFlowProofCookies(),
		createAuthFlowProofCookiesSetOptions(setCookieOptions, {
			secure: isNonSSLOrigin(origin),
		}),
	);

	return new Response(null, {
		status: 302,
		headers,
	});
};
