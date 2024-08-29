// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CognitoUserPoolConfig } from '@aws-amplify/core';
import { assertOAuthConfig } from '@aws-amplify/core/internals/utils';

import { openAuthSession } from '../../../../utils';
import { OpenAuthSessionResult } from '../../../../utils/types';

import { getRedirectUrl } from './getRedirectUrl';

export const oAuthSignOutRedirect = async (
	authConfig: CognitoUserPoolConfig,
	preferPrivateSession = false,
	redirectUrl?: string,
): Promise<void | OpenAuthSessionResult> => {
	assertOAuthConfig(authConfig);
	const { loginWith, userPoolClientId } = authConfig;
	const { domain, redirectSignOut } = loginWith.oauth;
	const signoutUri = getRedirectUrl(redirectSignOut, redirectUrl);
	const oAuthLogoutEndpoint = `https://${domain}/logout?${Object.entries({
		client_id: userPoolClientId,
		logout_uri: encodeURIComponent(signoutUri),
	})
		.map(([k, v]) => `${k}=${v}`)
		.join('&')}`;

	return openAuthSession(
		oAuthLogoutEndpoint,
		redirectSignOut,
		preferPrivateSession,
	);
};
