// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HandleAuthApiRouteRequestForPagesRouter } from './types';
import { isSupportedAuthApiRoutePath } from './utils';

export const handleAuthApiRouteRequestForPagesRouter: HandleAuthApiRouteRequestForPagesRouter =
	({ request, response }) => {
		if (request.method !== 'GET') {
			response.status(405).end();

			return;
		}

		const { slug } = request.query;
		if (slug === undefined || Array.isArray(slug)) {
			response.status(400).end();

			return;
		}

		if (!isSupportedAuthApiRoutePath(slug)) {
			response.status(404).end();

			return;
		}

		switch (slug) {
			case 'sign-up':
			case 'sign-in':
			case 'sign-out':
			case 'sign-in-callback':
			case 'sign-out-callback':
			default:
				response.status(501).end();
		}
	};
