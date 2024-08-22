// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	HttpResponse,
	MiddlewareContext,
	RetryDeciderOutput,
	getRetryDecider,
} from '@aws-amplify/core/internals/aws-client-utils';

import { LocationCredentialsProvider } from '../../../types/options';

import { parseXmlError } from './parsePayload';

/**
 * Function to decide if the S3 request should be retried. For S3 APIs, we support forceRefresh option
 * for {@link LocationCredentialsProvider | LocationCredentialsProvider } option. It's set when S3 returns
 * credentials expired error. In the retry decider, we detect this response and set flag to signify a retry
 * attempt. The retry attempt would invoke the LocationCredentialsProvider with forceRefresh option set.
 *
 * @param response Optional response of the request.
 * @param error Optional error thrown from previous attempts.
 * @param middlewareContext Optional context object to store data between retries.
 * @returns True if the request should be retried.
 */
export const retryDecider = async (
	response?: HttpResponse,
	error?: unknown,
	middlewareContext?: MiddlewareContext,
): Promise<RetryDeciderOutput> => {
	const defaultRetryDecider = getRetryDecider(parseXmlError);
	const defaultRetryDecision = await defaultRetryDecider(response, error);
	if (!response || response.statusCode < 300) {
		return { retryable: false };
	}
	const parsedError = await parseXmlError(response);
	const errorCode = parsedError?.name;
	const errorMessage = parsedError?.message;
	const isCredentialsExpired = isCredentialsExpiredError(
		errorCode,
		errorMessage,
	);

	return {
		retryable:
			defaultRetryDecision.retryable ||
			// If we know the previous retry attempt sets isCredentialsExpired in the
			// middleware context, we don't want to retry anymore.
			!!(isCredentialsExpired && !middlewareContext?.isCredentialsExpired),
		isCredentialsExpiredError: isCredentialsExpired,
	};
};

// Ref: https://github.com/aws/aws-sdk-js/blob/54829e341181b41573c419bd870dd0e0f8f10632/lib/event_listeners.js#L522-L541
const INVALID_TOKEN_ERROR_CODES = [
	'RequestExpired',
	'ExpiredTokenException',
	'ExpiredToken',
];

/**
 * Given an error code, returns true if it is related to invalid credentials.
 *
 * @param errorCode String representation of some error.
 * @returns True if given error indicates the credentials used to authorize request
 * are invalid.
 */
const isCredentialsExpiredError = (
	errorCode?: string,
	errorMessage?: string,
) => {
	const isExpiredTokenError =
		!!errorCode && INVALID_TOKEN_ERROR_CODES.includes(errorCode);
	// Ref: https://github.com/aws/aws-sdk-js/blob/54829e341181b41573c419bd870dd0e0f8f10632/lib/event_listeners.js#L536-L539
	const isExpiredSignatureError =
		!!errorCode &&
		!!errorMessage &&
		errorCode.includes('Signature') &&
		errorMessage.includes('expired');

	return isExpiredTokenError || isExpiredSignatureError;
};
