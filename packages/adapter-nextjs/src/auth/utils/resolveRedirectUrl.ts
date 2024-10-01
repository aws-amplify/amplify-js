// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { OAuthConfig } from '@aws-amplify/core';
import { AmplifyServerContextError } from '@aws-amplify/core/internals/adapter-core';

export const resolveRedirectSignInUrl = (
	origin: string,
	oAuthConfig: OAuthConfig,
) => {
	const redirectUrl = oAuthConfig.redirectSignIn.find(url =>
		url.startsWith(origin),
	);

	if (!redirectUrl) {
		throw createError('redirectSignIn');
	}

	return redirectUrl;
};

export const resolveRedirectSignOutUrl = (
	origin: string,
	oAuthConfig: OAuthConfig,
) => {
	const redirectUrl = oAuthConfig.redirectSignOut.find(url =>
		url.startsWith(origin),
	);

	if (!redirectUrl) {
		throw createError('redirectSignOut');
	}

	return redirectUrl;
};

const createError = (urlType: string): AmplifyServerContextError =>
	new AmplifyServerContextError({
		message: `No valid ${urlType} url found in the OAuth config.`,
		recoverySuggestion: `Check the OAuth config and ensure the ${urlType} url is valid.`,
	});
