// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HandleAuthApiRouteRequestForAppRouter } from './types';
import { isSupportedAuthApiRoutePath } from './utils';

export const handleAuthApiRouteRequestForAppRouter: HandleAuthApiRouteRequestForAppRouter =
	({ request, handlerContext }) => {
		if (request.method !== 'GET') {
			return new Response(null, { status: 405 });
		}

		const { slug } = handlerContext.params;

		if (slug === undefined || Array.isArray(slug)) {
			return new Response(null, { status: 400 });
		}

		if (!isSupportedAuthApiRoutePath(slug)) {
			return new Response(null, { status: 404 });
		}

		switch (slug) {
			case 'sign-up':
			case 'sign-in':
			case 'sign-out':
			case 'sign-in-callback':
			case 'sign-out-callback':
			default:
				return new Response(null, { status: 501 });
		}
	};
