// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ErrorParser, HttpResponse } from '../../types';

import { isClockSkewError } from './isClockSkewError';

/**
 * Get retry decider function
 * @param errorParser Function to load JavaScript error from HTTP response
 */
export const getRetryDecider =
	(errorParser: ErrorParser) =>
	async (response?: HttpResponse, error?: unknown): Promise<boolean> => {
		const parsedError =
			(error as Error & { code: string }) ??
			(await errorParser(response)) ??
			undefined;
		const errorCode = parsedError?.code || parsedError?.name;
		const statusCode = response?.statusCode;

		return (
			isConnectionError(error) ||
			isThrottlingError(statusCode, errorCode) ||
			isClockSkewError(errorCode) ||
			isServerSideError(statusCode, errorCode)
		);
	};

// reference: https://github.com/aws/aws-sdk-js-v3/blob/ab0e7be36e7e7f8a0c04834357aaad643c7912c3/packages/service-error-classification/src/constants.ts#L22-L37
const THROTTLING_ERROR_CODES = [
	'BandwidthLimitExceeded',
	'EC2ThrottledException',
	'LimitExceededException',
	'PriorRequestNotComplete',
	'ProvisionedThroughputExceededException',
	'RequestLimitExceeded',
	'RequestThrottled',
	'RequestThrottledException',
	'SlowDown',
	'ThrottledException',
	'Throttling',
	'ThrottlingException',
	'TooManyRequestsException',
];

const TIMEOUT_ERROR_CODES = [
	'TimeoutError',
	'RequestTimeout',
	'RequestTimeoutException',
];

const isThrottlingError = (statusCode?: number, errorCode?: string) =>
	statusCode === 429 ||
	(!!errorCode && THROTTLING_ERROR_CODES.includes(errorCode));

const isConnectionError = (error?: unknown) =>
	(error as Error)?.name === 'Network error';

const isServerSideError = (statusCode?: number, errorCode?: string) =>
	(!!statusCode && [500, 502, 503, 504].includes(statusCode)) ||
	(!!errorCode && TIMEOUT_ERROR_CODES.includes(errorCode));
