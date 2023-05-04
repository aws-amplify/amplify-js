// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { retryMiddleware, RetryOptions } from '../middleware/retry';
import { signingMiddleware, SigningOptions } from '../middleware/signing';
import { userAgentMiddleware, UserAgentOptions } from '../middleware/userAgent';
import { composeTransferHandler } from '../internal/composeTransferHandler';
import { fetchTransferHandler } from './fetch';
import { HttpRequest, HttpResponse } from '../types';

export const authenticatedHandler = composeTransferHandler<
	[UserAgentOptions, RetryOptions<HttpResponse>, SigningOptions],
	HttpRequest,
	HttpResponse
>(fetchTransferHandler, [
	userAgentMiddleware,
	retryMiddleware,
	signingMiddleware,
]);
