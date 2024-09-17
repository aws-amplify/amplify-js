// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO(ashwinkumar6): remove duplicate storage/src/providers/s3/utils/client/runtime/s3TransferHandler/xhr.ts
import {
	HttpRequest,
	HttpResponse,
	RetryOptions,
	SigningOptions,
	UserAgentOptions,
	retryMiddlewareFactory,
	signingMiddlewareFactory,
	userAgentMiddlewareFactory,
} from '@aws-amplify/core/internals/aws-client-utils';
import { composeTransferHandler } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { contentSha256MiddlewareFactory } from '../contentSha256middleware';
import { xhrTransferHandler } from '../xhrTransferHandler';

/**
 * S3 transfer handler for browser and React Native based on XHR. On top of basic transfer handler, it also supports
 * x-amz-content-sha256 header, and request&response process tracking.
 *
 * @internal
 */
export const s3TransferHandler = composeTransferHandler<
	[object, UserAgentOptions, RetryOptions<HttpResponse>, SigningOptions],
	HttpRequest,
	HttpResponse,
	typeof xhrTransferHandler
>(xhrTransferHandler, [
	contentSha256MiddlewareFactory,
	userAgentMiddlewareFactory,
	retryMiddlewareFactory,
	signingMiddlewareFactory,
]);
