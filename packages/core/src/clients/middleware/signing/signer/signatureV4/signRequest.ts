// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpRequest } from '../../../../types';
import { SignRequestOptions } from './types/signer';
import { getCanonicalRequest } from './utils/getCanonicalRequest';
import { getCredentialScope } from './utils/getCredentialScope';
import { getFormattedDates } from './utils/getFormattedDates';
import { getSigningKey } from './utils/getSigningKey';
import { getSignedHeaders } from './utils/getSignedHeaders';
import { getStringToSign } from './utils/getStringToSign';
import { getHashedDataAsHex } from './utils/dataHashHelpers';
import {
	AMZ_DATE_HEADER,
	AUTH_HEADER,
	HOST_HEADER,
	SHA256_ALGORITHM_IDENTIFIER,
	TOKEN_HEADER,
} from './constants';

/**
 * Given a `Presignable` object, returns a Signature Version 4 presigned `URL` object.
 *
 * @param request `HttpRequest` to be signed.
 * @param signRequestOptions `SignRequestOptions` object containing values used to construct the signature.
 * @returns A `HttpRequest` with authentication headers which can grant temporary access to AWS resources.
 */
export const signRequest = async (
	request: HttpRequest,
	{
		credentials,
		signingDate = new Date(),
		signingRegion,
		signingService,
	}: SignRequestOptions
): Promise<HttpRequest> => {
	// get properties from credentials
	const { accessKeyId, secretAccessKey, sessionToken } = credentials;
	// get formatted dates for signing
	const { longDate, shortDate } = getFormattedDates(signingDate);
	// copy header and set signing properties
	const headers = { ...request.headers };
	headers[HOST_HEADER] = request.url.host;
	headers[AMZ_DATE_HEADER] = longDate;
	if (sessionToken) {
		headers[TOKEN_HEADER] = sessionToken;
	}
	const signedRequest = { ...request, headers };

	// create a signed AWS API request
	// https://docs.aws.amazon.com/IAM/latest/UserGuide/create-signed-request.html
	// step 1: create a canonical request
	const canonicalRequest = await getCanonicalRequest(signedRequest);

	// step 2: create a hash of the canonical request
	const hashedRequest = await getHashedDataAsHex(null, canonicalRequest);

	// step 3: create a string to sign
	const credentialScope = getCredentialScope(
		shortDate,
		signingRegion,
		signingService
	);
	const stringToSign = await getStringToSign(
		longDate,
		credentialScope,
		hashedRequest
	);

	// step 4: calculate the signature
	const signature = await getHashedDataAsHex(
		await getSigningKey(
			secretAccessKey,
			shortDate,
			signingRegion,
			signingService
		),
		stringToSign
	);

	// step 5: add the signature to the request
	const credentialEntry = `Credential=${accessKeyId}/${credentialScope}`;
	const signedHeadersEntry = `SignedHeaders=${getSignedHeaders(headers)}`;
	const signatureEntry = `Signature=${signature}`;
	headers[
		AUTH_HEADER
	] = `${SHA256_ALGORITHM_IDENTIFIER} ${credentialEntry}, ${signedHeadersEntry}, ${signatureEntry}`;

	return signedRequest;
};
