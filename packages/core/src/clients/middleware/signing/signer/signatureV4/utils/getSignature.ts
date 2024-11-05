// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpRequest } from '../../../../../types';
import { SigningValues } from '../types/signer';

import { getHashedDataAsHex } from './dataHashHelpers';
import { getCanonicalRequest } from './getCanonicalRequest';
import { getSigningKey } from './getSigningKey';
import { getStringToSign } from './getStringToSign';

/**
 * Calculates and returns an AWS API Signature.
 * https://docs.aws.amazon.com/IAM/latest/UserGuide/create-signed-request.html
 *
 * @param request `HttpRequest` to be signed.
 * @param signRequestOptions `SignRequestOptions` object containing values used to construct the signature.
 * @returns AWS API Signature to sign a request or url with.
 *
 * @internal
 */
export const getSignature = (
	request: HttpRequest,
	{
		credentialScope,
		longDate,
		secretAccessKey,
		shortDate,
		signingRegion,
		signingService,
		uriEscapePath,
	}: SigningValues,
): string => {
	// step 1: create a canonical request
	const canonicalRequest = getCanonicalRequest(request, uriEscapePath);

	// step 2: create a hash of the canonical request
	const hashedRequest = getHashedDataAsHex(null, canonicalRequest);

	// step 3: create a string to sign
	const stringToSign = getStringToSign(
		longDate,
		credentialScope,
		hashedRequest,
	);

	// step 4: calculate the signature
	const signature = getHashedDataAsHex(
		getSigningKey(secretAccessKey, shortDate, signingRegion, signingService),
		stringToSign,
	);

	return signature;
};
