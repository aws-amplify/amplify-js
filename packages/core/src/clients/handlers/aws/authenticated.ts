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
	SigningOptions,
	signingMiddlewareFactory,
} from '../../middleware/signing';
import {
	UserAgentOptions,
	userAgentMiddlewareFactory,
} from '../../middleware/userAgent';
import { composeTransferHandler } from '../../internal/composeTransferHandler';
import { HttpRequest, HttpResponse } from '../../types';
import { fetchTransferHandler } from '../fetch';

export const authenticatedHandler = composeTransferHandler<
	[
		UserAgentOptions,
		object,
		RetryOptions<HttpResponse>,
		RetryInfoMiddlewareOptions,
		SigningOptions,
	],
	HttpRequest,
	HttpResponse,
	typeof fetchTransferHandler
>(fetchTransferHandler, [
	userAgentMiddlewareFactory,
	invocationIdMiddlewareFactory,
	retryMiddlewareFactory,
	retryInfoMiddlewareFactory,
	signingMiddlewareFactory,
]);
