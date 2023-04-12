// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Presignable, SignUrlOptions } from './types';
import { getCanonicalRequest } from './utils/getCanonicalRequest';
import { getCredentialScope } from './utils/getCredentialScope';
import { getFormattedDates } from './utils/getFormattedDates';
import { getSigningKey } from './utils/getSigningKey';
import { getStringToSign } from './utils/getStringToSign';
import { getHashedDataAsHex } from './utils/dataHashHelpers';
import {
	ALGORITHM_QUERY_PARAM,
	AMZ_DATE_QUERY_PARAM,
	CREDENTIAL_QUERY_PARAM,
	EXPIRES_QUERY_PARAM,
	HOST_HEADER,
	SHA256_ALGORITHM_IDENTIFIER,
	SIGNATURE_QUERY_PARAM,
	SIGNED_HEADERS_QUERY_PARAM,
	TOKEN_QUERY_PARAM,
} from './constants';

export const presignUrl = async (
	{ body, method = 'GET', url }: Presignable,
	{
		credentials,
		expiration, // TODO: V6 introduce default expiration on all presigned URLs
		signingDate = new Date(),
		signingRegion,
		signingService,
	}: SignUrlOptions
): Promise<URL> => {
	// get properties from credentials
	const { accessKeyId, secretAccessKey, sessionToken } = credentials;
	// get formatted dates for signing
	const { longDate, shortDate } = getFormattedDates(signingDate);
	// get credentials scope for query
	const credentialScope = getCredentialScope(
		shortDate,
		signingRegion,
		signingService
	);
	// create URL object and add query strings
	const presignedUrl = new URL(url);
	Object.entries({
		[ALGORITHM_QUERY_PARAM]: SHA256_ALGORITHM_IDENTIFIER,
		[CREDENTIAL_QUERY_PARAM]: `${accessKeyId}/${credentialScope}`,
		[AMZ_DATE_QUERY_PARAM]: longDate,
		[SIGNED_HEADERS_QUERY_PARAM]: HOST_HEADER,
		...(expiration && { [EXPIRES_QUERY_PARAM]: expiration.toString() }),
		...(sessionToken && { [TOKEN_QUERY_PARAM]: sessionToken }),
	}).forEach(([key, value]) => {
		presignedUrl.searchParams.append(key, value);
	});

	// create a presigned AWS API url
	// step 1: create a canonical request
	const canonicalRequest = await getCanonicalRequest({
		body,
		headers: { [HOST_HEADER]: url.host },
		method,
		url: presignedUrl,
	});

	// step 2: create a hash of the canonical request
	const hashedRequest = await getHashedDataAsHex(null, canonicalRequest);

	// step 3: create a string to sign
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

	// step 5: add the signature to the url
	presignedUrl.searchParams.append(SIGNATURE_QUERY_PARAM, signature);

	return presignedUrl;
};
