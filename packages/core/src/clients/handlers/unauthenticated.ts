// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { RetryOptions, retryMiddlewareFactory } from '../middleware/retry';
import {
	UserAgentOptions,
	userAgentMiddlewareFactory,
} from '../middleware/userAgent';
import { composeTransferHandler } from '../internal/composeTransferHandler';
import { HttpRequest, HttpResponse } from '../types';

import { fetchTransferHandler } from './fetch';

export const unauthenticatedHandler = composeTransferHandler<
	[UserAgentOptions, RetryOptions<HttpResponse>],
	HttpRequest,
	HttpResponse,
	typeof fetchTransferHandler
>(fetchTransferHandler, [userAgentMiddlewareFactory, retryMiddlewareFactory]);
