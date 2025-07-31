// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	HttpRequest,
	HttpResponse,
	unauthenticatedHandler,
} from '../../../../../clients';
import { composeTransferHandler } from '../../../../../clients/internal';
import { createDisableCacheMiddleware } from '../../../middleware';

/**
 * A Cognito Identity-specific transfer handler that does NOT sign requests, and
 * disables caching.
 *
 * @internal
 */
export const cognitoIdentityTransferHandler = composeTransferHandler<
	[Parameters<typeof createDisableCacheMiddleware>[0]],
	HttpRequest,
	HttpResponse,
	typeof unauthenticatedHandler
>(unauthenticatedHandler, [createDisableCacheMiddleware]);
