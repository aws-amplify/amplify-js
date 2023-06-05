// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Credentials,
	HttpRequest,
	HttpResponse,
	MiddlewareHandler,
} from '../../types';
import { isClockSkewError } from '../../utils/isClockSkewError';
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
			try {
				const response = await next(signedRequest);
				return response;
			} catch (error) {
				const dateString = shouldUseServerTime(error)
					? error.ServerTime
					: getDateHeader(error.$response);
				if (dateString) {
					currentSystemClockOffset = getUpdatedSystemClockOffset(
						Date.parse(dateString),
						currentSystemClockOffset
					);
				}
				throw error;
			}
		};
};

const shouldUseServerTime = ({ ServerTime, Code }: any): boolean =>
	ServerTime && isClockSkewError(Code);

const getDateHeader = ({ headers }: any = {}): string | undefined =>
	headers?.date ?? headers?.Date;
