// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { RetryOptions, retryMiddleware } from '../middleware/retry';
import { UserAgentOptions, userAgentMiddleware } from '../middleware/userAgent';
import { composeTransferHandler } from '../internal/composeTransferHandler';
import { HttpRequest, HttpResponse } from '../types';

import { fetchTransferHandler } from './fetch';

export const unauthenticatedHandler = composeTransferHandler<
	[UserAgentOptions, RetryOptions<HttpResponse>],
	HttpRequest,
	HttpResponse,
	typeof fetchTransferHandler
>(fetchTransferHandler, [userAgentMiddleware, retryMiddleware]);
