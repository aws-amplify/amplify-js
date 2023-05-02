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
	systemClockOffset?: number;
}

/**
 * Signing middleware
 */
export const signingMiddleware = ({
	credentials,
	region,
	service,
	systemClockOffset = 0,
}: SigningOptions) => {
	let currentSystemClockOffset;
	return (next: MiddlewareHandler<HttpRequest, HttpResponse>) =>
		async function signingMiddleware(request: HttpRequest) {
			currentSystemClockOffset = currentSystemClockOffset ?? systemClockOffset;
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
				const clockTime = shouldUseServerTime(error)
					? error.ServerTime
					: getDateHeader(error.$response);
				if (clockTime) {
					currentSystemClockOffset = getUpdatedSystemClockOffset(
						clockTime,
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
