// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { GraphQLAuthMode } from '@aws-amplify/core/internals/utils';
import { AmplifyClassV6 } from '@aws-amplify/core';

import { GraphQLApiError } from '../utils/errors';
import {
	NO_API_KEY,
	NO_AUTH_TOKEN_HEADER,
	NO_SIGNED_IN_USER,
	NO_VALID_AUTH_TOKEN,
	NO_VALID_CREDENTIALS,
} from '../utils/errors/constants';

export async function headerBasedAuth(
	amplify: AmplifyClassV6,
	authMode: GraphQLAuthMode,
	apiKey: string | undefined,
	additionalHeaders: Record<string, string> = {},
) {
	let headers = {};

	switch (authMode) {
		case 'apiKey':
			if (!apiKey) {
				throw new GraphQLApiError(NO_API_KEY);
			}
			headers = {
				'X-Api-Key': apiKey,
			};
			break;
		case 'iam': {
			const session = await amplify.Auth.fetchAuthSession();
			if (session.credentials === undefined) {
				throw new GraphQLApiError(NO_VALID_CREDENTIALS);
			}
			break;
		}
		case 'oidc':
		case 'userPool': {
			let token: string | undefined;

			try {
				token = (
					await amplify.Auth.fetchAuthSession()
				).tokens?.accessToken.toString();
			} catch (e) {
				// fetchAuthSession failed
				throw new GraphQLApiError({
					...NO_SIGNED_IN_USER,
					underlyingError: e,
				});
			}

			// `fetchAuthSession()` succeeded but didn't return `tokens`.
			// This may happen when unauthenticated access is enabled and there is
			// no user signed in.
			if (!token) {
				throw new GraphQLApiError(NO_VALID_AUTH_TOKEN);
			}

			headers = {
				Authorization: token,
			};
			break;
		}
		case 'lambda':
			if (
				typeof additionalHeaders === 'object' &&
				!additionalHeaders.Authorization
			) {
				throw new GraphQLApiError(NO_AUTH_TOKEN_HEADER);
			}

			headers = {
				Authorization: additionalHeaders.Authorization,
			};
			break;
		case 'none':
			break;
		default:
			break;
	}

	return headers;
}
