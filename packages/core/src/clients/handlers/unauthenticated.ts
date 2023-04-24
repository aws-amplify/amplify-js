// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { retryMiddleware, RetryOptions } from '../middleware/retry';
import { userAgentMiddleware, UserAgentOptions } from '../middleware/userAgent';
import { composeTransferHandler } from '../internal/composeTransferHandler';
import { fetchTransferHandler } from './fetch';
import { HttpRequest, HttpResponse } from '../types';

export const unauthenticatedHandler = composeTransferHandler<
	[UserAgentOptions, RetryOptions<HttpResponse>],
	HttpRequest,
	HttpResponse
>(fetchTransferHandler, [userAgentMiddleware, retryMiddleware]);
