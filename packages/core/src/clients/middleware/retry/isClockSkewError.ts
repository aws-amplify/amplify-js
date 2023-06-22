// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// via https://github.com/aws/aws-sdk-js-v3/blob/ab0e7be36e7e7f8a0c04834357aaad643c7912c3/packages/service-error-classification/src/constants.ts#L8
const CLOCK_SKEW_ERROR_CODES = [
	'AuthFailure',
	'InvalidSignatureException',
	'RequestExpired',
	'RequestInTheFuture',
	'RequestTimeTooSkewed',
	'SignatureDoesNotMatch',
	'BadRequestException', // API Gateway
];

/**
 * Given an error code, returns true if it is related to a clock skew error.
 *
 * @param errorCode String representation of some error.
 * @returns True if given error is present in `CLOCK_SKEW_ERROR_CODES`, false otherwise.
 *
 * @internal
 */
export const isClockSkewError = (errorCode?: string) =>
	CLOCK_SKEW_ERROR_CODES.includes(errorCode);
