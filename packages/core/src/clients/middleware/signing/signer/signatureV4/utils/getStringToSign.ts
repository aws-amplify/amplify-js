// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SHA256_ALGORITHM_IDENTIFIER } from '../constants';

/**
 * Returns a string to be signed.
 *
 * @param date Current date in the format 'YYYYMMDDThhmmssZ'.
 * @param credentialScope String representing the credential scope with format 'YYYYMMDD/region/service/aws4_request'.
 * @param hashedRequest Hashed canonical request.
 *
 * @returns A string created by by concatenating the following strings, separated by newline characters:
 * - Algorithm
 * - RequestDateTime
 * - CredentialScope
 * - HashedCanonicalRequest
 *
 * @internal
 */
export const getStringToSign = (
	date: string,
	credentialScope: string,
	hashedRequest: string,
): string =>
	[SHA256_ALGORITHM_IDENTIFIER, date, credentialScope, hashedRequest].join(
		'\n',
	);
