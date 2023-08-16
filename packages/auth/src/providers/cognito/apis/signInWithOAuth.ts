// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6, assertTokenProviderConfig } from '@aws-amplify/core';
import {
	SignInWithWebUIRequest as SignInWithOAuthRequest,
	isSignInWithWebUIOAuthProvider,
} from '../../../types/requests';
import { CognitoSignInWithWebUIOptions as CognitoSignInWithOAuthOptions } from '../types/options';
import { assertOAuthConfig } from '@aws-amplify/core/lib-esm/singleton/Auth/utils';

const SELF = '_self';

/**
 * Signs a user in using a custom authentication flow without password
 *
 * @param signInRequest - The SignInRequest object
 * @returns AuthSignInResult
 * @throws service: {@link InitiateAuthException } - Cognito service errors thrown during the sign-in process.
 * @throws validation: {@link AuthValidationErrorCode  } - Validation errors thrown when either username or password
 *  are not defined.
 *
 * TODO: add config errors
 */
export function signInWithOAuth(
	signInWithOAuthRequest: SignInWithOAuthRequest<CognitoSignInWithOAuthOptions>
): void {
	const authConfig = AmplifyV6.getConfig().Auth;
	assertOAuthConfig(authConfig);

	let url: URL;

	if (isSignInWithWebUIOAuthProvider(signInWithOAuthRequest)) {
		url = new URL(authConfig.oauth.domain);
	} else {
		url = new URL(authConfig.oauth.domain);
	}
	window.open(url, SELF);
}
