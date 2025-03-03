// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	RetryInfoMiddlewareOptions,
	RetryOptions,
	invocationIdMiddlewareFactory,
	retryInfoMiddlewareFactory,
	retryMiddlewareFactory,
} from '../../middleware/retry';
import {
	UserAgentOptions,
	userAgentMiddlewareFactory,
} from '../../middleware/userAgent';
import { composeTransferHandler } from '../../internal/composeTransferHandler';
import { HttpRequest, HttpResponse } from '../../types';
import { fetchTransferHandler } from '../fetch';

export const unauthenticatedHandler = composeTransferHandler<
	[
		UserAgentOptions,
		object,
		RetryOptions<HttpResponse>,
		RetryInfoMiddlewareOptions,
	],
	HttpRequest,
	HttpResponse,
	typeof fetchTransferHandler
>(fetchTransferHandler, [
	userAgentMiddlewareFactory,
	invocationIdMiddlewareFactory,
	retryMiddlewareFactory,
	retryInfoMiddlewareFactory,
]);
