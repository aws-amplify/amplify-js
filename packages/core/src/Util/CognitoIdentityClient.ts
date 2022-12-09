// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { Provider } from '@aws-sdk/types';
import { getAmplifyUserAgent } from '../Platform';

/**
 * Returns a CognitoIdentityClient with middleware
 * @param {string} region
 * @return {CognitoIdentityClient}
 */
export function createCognitoIdentityClient(
	region: string | Provider<string> | undefined
): CognitoIdentityClient {
	const client = new CognitoIdentityClient({
		region,
		customUserAgent: getAmplifyUserAgent(),
	});

	client.middlewareStack.add(
		(next, _) => (args: any) => {
			return next(middlewareArgs(args));
		},
		{
			step: 'build',
			name: 'cacheControlMiddleWare',
		}
	);

	return client;
}

function middlewareArgs(args: { request: { headers: any }; input: any }) {
	return {
		...args,
		request: {
			...args.request,
			headers: {
				...args.request.headers,
				'cache-control': 'no-store',
			},
		},
	};
}
