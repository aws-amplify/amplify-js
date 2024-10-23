// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpRequest, HttpResponse, Middleware } from '../../../clients';

/**
 * A Cognito Identity-specific middleware that disables caching for all requests.
 */
export const createDisableCacheMiddleware: Middleware<
	HttpRequest,
	HttpResponse,
	Record<string, unknown>
> = () => next =>
	async function disableCacheMiddleware(request) {
		request.headers['cache-control'] = 'no-store';

		return next(request);
	};
