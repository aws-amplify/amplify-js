// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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
 *
 * @internal
 */
export const isInvalidCredentialsError = (
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
