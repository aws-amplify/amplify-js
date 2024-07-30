// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Credentials,
	HttpRequest,
	HttpResponse,
	MiddlewareHandler,
} from '../../types';
import { MiddlewareContext } from '../../types/core';

import { signRequest } from './signer/signatureV4';
import { getSkewCorrectedDate } from './utils/getSkewCorrectedDate';
import { getUpdatedSystemClockOffset } from './utils/getUpdatedSystemClockOffset';

/**
 * Options type for the async callback function returning aws credentials. This
 * function is used by SigV4 signer to resolve the aws credentials
 */
export interface CredentialsProviderOptions {
	forceRefresh?: boolean;
}

/**
 * Configuration of the signing middleware
 */
export interface SigningOptions {
	credentials:
		| Credentials
		| ((options?: CredentialsProviderOptions) => Promise<Credentials>);
	region: string;
	service: string;

	/**
	 * Whether to uri encode the path as part of canonical uri. It's used for S3 only where the pathname
	 * is already uri encoded, and the signing process is not expected to uri encode it again.
	 *
	 * @default true
	 */
	uriEscapePath?: boolean;
}

/**
 * Middleware that SigV4 signs request with AWS credentials, and correct system clock offset.
 * This middleware is expected to be placed after retry middleware.
 */
export const signingMiddlewareFactory = ({
	credentials,
	region,
	service,
	uriEscapePath = true,
}: SigningOptions) => {
	let currentSystemClockOffset: number;

	return (
		next: MiddlewareHandler<HttpRequest, HttpResponse>,
		context: MiddlewareContext,
	) =>
		async function signingMiddleware(request: HttpRequest) {
			currentSystemClockOffset = currentSystemClockOffset ?? 0;
			const signRequestOptions = {
				credentials:
					typeof credentials === 'function'
						? await credentials({
								forceRefresh: !!context?.isCredentialsExpired,
							})
						: credentials,
				signingDate: getSkewCorrectedDate(currentSystemClockOffset),
				signingRegion: region,
				signingService: service,
				uriEscapePath,
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
					currentSystemClockOffset,
				);
			}

			return response;
		};
};

const getDateHeader = ({ headers }: any = {}): string | undefined =>
	headers?.date ?? headers?.Date ?? headers?.['x-amz-date'];
