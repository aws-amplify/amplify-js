// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	HttpRequest,
	HttpResponse,
	RetryOptions,
	UserAgentOptions,
	fetchTransferHandler,
	retryMiddlewareFactory,
	userAgentMiddlewareFactory,
} from '@aws-amplify/core/internals/aws-client-utils';
import { composeTransferHandler } from '@aws-amplify/core/internals/aws-client-utils/composers';

/**
 * @internal
 */
export const unauthenticatedHandler = composeTransferHandler<
	[UserAgentOptions, RetryOptions<HttpResponse>],
	HttpRequest,
	HttpResponse,
	typeof fetchTransferHandler
>(fetchTransferHandler, [userAgentMiddlewareFactory, retryMiddlewareFactory]);
