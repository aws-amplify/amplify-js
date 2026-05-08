// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getGlobalContext, hasGlobalContext } from '@aws-amplify/core';
import { composeTransferHandler } from '@aws-amplify/core/internals/aws-client-utils/composers';
import {
	HttpRequest,
	Middleware,
	unauthenticatedHandler,
} from '@aws-amplify/core/internals/aws-client-utils';
import { HttpResponse } from '@aws-amplify/core/src/clients/types';

/**
 * A Cognito Identity-specific middleware that disables caching for all requests.
 */
const disableCacheMiddlewareFactory: Middleware<
	HttpRequest,
	HttpResponse,
	Record<string, unknown>
> = () => (next, _) =>
	async function disableCacheMiddleware(request) {
		request.headers = {
			...request.headers,
			'cache-control': 'no-store',
			...(hasGlobalContext() &&
				(await getGlobalContext().libraryOptions?.Auth?.headers?.())),
		};

		return next(request);
	};

/**
 * A Cognito Identity-specific transfer handler that does NOT sign requests, and
 * disables caching.
 *
 * @internal
 */
export const cognitoUserPoolTransferHandler = composeTransferHandler<
	[Parameters<typeof disableCacheMiddlewareFactory>[0]],
	HttpRequest,
	HttpResponse,
	typeof unauthenticatedHandler
>(unauthenticatedHandler, [disableCacheMiddlewareFactory]);
