// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { RetryOptions, retryMiddleware } from '~/src/clients/middleware/retry';
import {
	SigningOptions,
	signingMiddleware,
} from '~/src/clients/middleware/signing';
import {
	UserAgentOptions,
	userAgentMiddleware,
} from '~/src/clients/middleware/userAgent';
import { composeTransferHandler } from '~/src/clients/internal/composeTransferHandler';
import { HttpRequest, HttpResponse } from '~/src/clients/types';

import { fetchTransferHandler } from './fetch';

export const authenticatedHandler = composeTransferHandler<
	[UserAgentOptions, RetryOptions<HttpResponse>, SigningOptions],
	HttpRequest,
	HttpResponse,
	typeof fetchTransferHandler
>(fetchTransferHandler, [
	userAgentMiddleware,
	retryMiddleware,
	signingMiddleware,
]);
