// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpRequest, HttpResponse, Middleware } from '../../types';
import { amplifyUuid } from '../../../libraryUtils';

const SDK_INVOCATION_ID_HEADER = 'amz-sdk-invocation-id';

/**
 * Middleware injects a UUID string to `amz-sdk-invocation-id` header.
 * if the header is not set already. This header is helpful to provide
 * observability to group the requests caused by automatic retry.
 *
 * This middleware is standalone because of extra UUID dependency, we will
 * NOT use this middleware for API categories.
 *
 * Ref: https://sdk.amazonaws.com/kotlin/api/smithy-kotlin/api/1.0.9/http-client/aws.smithy.kotlin.runtime.http.operation/-http-operation-context/-sdk-invocation-id.html
 */
export const invocationIdMiddlewareFactory: Middleware<
	HttpRequest,
	HttpResponse,
	object
> = () => next => {
	return async function userAgentMiddleware(request) {
		if (!request?.headers?.[SDK_INVOCATION_ID_HEADER]) {
			request.headers[SDK_INVOCATION_ID_HEADER] = amplifyUuid();
		}

		return next(request);
	};
};
