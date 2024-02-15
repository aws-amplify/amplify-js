// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyUrl } from '../../../../../utils/amplifyUrl';

import { PresignUrlOptions, Presignable } from './types';
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
import { getSigningValues } from './utils/getSigningValues';
import { getSignature } from './utils/getSignature';

/**
 * Given a `Presignable` object, returns a Signature Version 4 presigned `URL` object.
 *
 * @param presignable `Presignable` object containing at least a url to be presigned with authentication query params.
 * @param presignUrlOptions `PresignUrlOptions` object containing values used to construct the signature.
 * @returns A `URL` with authentication query params which can grant temporary access to AWS resources.
 */
export const presignUrl = (
	{ body, method = 'GET', url }: Presignable,
	{ expiration, ...options }: PresignUrlOptions,
): URL => {
	const signingValues = getSigningValues(options);
	const { accessKeyId, credentialScope, longDate, sessionToken } =
		signingValues;

	// create the request to sign
	const presignedUrl = new AmplifyUrl(url);
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
	const requestToSign = {
		body,
		headers: { [HOST_HEADER]: url.host },
		method,
		url: presignedUrl,
	};

	// calculate and add the signature to the url
	const signature = getSignature(requestToSign, signingValues);
	presignedUrl.searchParams.append(SIGNATURE_QUERY_PARAM, signature);

	return presignedUrl;
};
