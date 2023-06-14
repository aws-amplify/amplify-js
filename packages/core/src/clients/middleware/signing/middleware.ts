// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Credentials,
	HttpRequest,
	HttpResponse,
	MiddlewareHandler,
} from '../../types';
import { signRequest } from './signer/signatureV4';
import { getSkewCorrectedDate } from './utils/getSkewCorrectedDate';
import { getUpdatedSystemClockOffset } from './utils/getUpdatedSystemClockOffset';

/**
 * Configuration of the signing middleware
 */
export interface SigningOptions {
	credentials: Credentials;
	region: string;
	service: string;
}

/**
 * Middleware that SigV4 signs request with AWS credentials, and correct system clock offset.
 * This middleware is expected to be placed after retry middleware.
 */
export const signingMiddleware = ({
	credentials,
	region,
	service,
}: SigningOptions) => {
	let currentSystemClockOffset;
	return (next: MiddlewareHandler<HttpRequest, HttpResponse>) =>
		async function signingMiddleware(request: HttpRequest) {
			currentSystemClockOffset = currentSystemClockOffset ?? 0;
			const signRequestOptions = {
				credentials,
				signingDate: getSkewCorrectedDate(currentSystemClockOffset),
				signingRegion: region,
				signingService: service,
			};
			const signedRequest = await signRequest(request, signRequestOptions);
			const response = await next(signedRequest);
			// Update system clock offset if response contains date header, regardless of the status code.
			// non-2xx response will still be returned from next handler instead of thrown, because it's
			// only thrown by the retry middleware.
			const dateString = getDateHeader(response);
			if (dateString) {
				currentSystemClockOffset = getUpdatedSystemClockOffset(
					Date.parse(dateString),
					currentSystemClockOffset
				);
			}
			return response;
		};
};

const getDateHeader = ({ headers }: any = {}): string | undefined =>
	headers?.date ?? headers?.Date ?? headers?.['x-amz-date'];
