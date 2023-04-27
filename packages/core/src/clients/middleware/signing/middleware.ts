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
export const signingMiddleware = (signingOptions: SigningOptions) => {
	return (next: MiddlewareHandler<HttpRequest, HttpResponse>) =>
		async function signingMiddleware(request: HttpRequest) {
			let response: HttpResponse;
			const { credentials, region, service } = signingOptions;
			if (signingOptions.systemClockOffset == null) {
				signingOptions.systemClockOffset = 0;
			}
			const signRequestOptions = {
				credentials,
				signingDate: getSkewCorrectedDate(signingOptions.systemClockOffset),
				signingRegion: region,
				signingService: service,
			};
			const signedRequest = await signRequest(request, signRequestOptions);
			try {
				response = await next(signedRequest);
				return response;
			} catch (error) {
				const clockTime = shouldUseServerTime(error)
					? error.ServerTime
					: getDateHeader(error.$response);
				if (clockTime) {
					signingOptions.systemClockOffset = getUpdatedSystemClockOffset(
						clockTime,
						signingOptions.systemClockOffset
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
