// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	HttpRequest,
	getHashedPayload,
	MiddlewareHandler,
	HttpResponse,
} from '@aws-amplify/core/internals/aws-client-utils';
import { CONTENT_SHA256_HEADER } from './constants';

/**
 * A middleware that adds the x-amz-content-sha256 header to the request if it is not already present.
 * It's required for S3 requests in browsers where the request body is sent in 1 chunk.
 * @see https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-header-based-auth.html
 *
 * @internal
 */
export const contentSha256Middleware =
	(options: {}) => (next: MiddlewareHandler<HttpRequest, HttpResponse>) =>
		async function contentSha256Middleware(request: HttpRequest) {
			if (request.headers[CONTENT_SHA256_HEADER]) {
				return next(request);
			} else {
				const hash = await getHashedPayload(request.body);
				request.headers[CONTENT_SHA256_HEADER] = hash;
				return next(request);
			}
		};
