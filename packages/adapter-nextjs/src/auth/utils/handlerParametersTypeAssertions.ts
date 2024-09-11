// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NextRequest } from 'next/server';
import { NextApiRequest, NextApiResponse } from 'next';

import { AuthRouteHandlerParams, AuthRoutesHandlerContext } from '../types';

// NextRequest is the 1st parameter type for the API route handlers in the App Router
export function isNextRequest(request: object): request is NextRequest {
	// NextRequest extends the Web Request API with additional convenience methods.
	// Details: https://nextjs.org/docs/app/api-reference/functions/next-request#nexturl
	return request instanceof Request && 'nextUrl' in request;
}

// AuthRoutesHandlersContext is the 2nd parameter type for the API route handlers in the App Router
export function isAuthRoutesHandlersContext(
	context: object,
): context is AuthRoutesHandlerContext {
	return (
		'params' in context &&
		typeof context.params === 'object' &&
		context.params !== null &&
		isAuthRouteHandlerParams(context.params)
	);
}

function isAuthRouteHandlerParams(
	params: object,
): params is AuthRouteHandlerParams {
	return 'slug' in params && typeof params.slug === 'string';
}

// NextApiRequest is the 1st parameter type for the API route handlers in the Pages Router
export function isNextApiRequest(request: object): request is NextApiRequest {
	// Can't use `IncomingMessage` to validate the request is an instance of `NextApiRequest`
	// as `import from 'http'` breaks the Next.js build.
	// The `query` property is a convenience method added to the underlying `IncomingMessage`.
	return (
		'query' in request &&
		Object.prototype.toString.call(request.query) === '[object Object]'
	);
}

// NextApiResponse is the 2nd parameter type for the API route handlers in the Pages Router
export function isNextApiResponse(
	response: object,
): response is NextApiResponse {
	// Can't use `ServerResponse` to validate the request is an instance of `NextApiResponse`
	// as `import from 'http'` breaks the Next.js build.
	// The `redirect` method is a convenience method added to the underlying `ServerResponse`.
	return 'redirect' in response && typeof response.redirect === 'function';
}
