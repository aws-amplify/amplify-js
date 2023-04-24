// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpRequest } from '../../../../../types';
import { getCanonicalHeaders } from './getCanonicalHeaders';
import { getCanonicalQueryString } from './getCanonicalQueryString';
import { getCanonicalUri } from './getCanonicalUri';
import { getHashedPayload } from './getHashedPayload';
import { getSignedHeaders } from './getSignedHeaders';

/**
 * Returns a canonical request.
 *
 * @param request `HttpRequest` from which to create the canonical request from.
 * @returns String created by by concatenating the following strings, separated by newline characters:
 * - HTTPMethod
 * - CanonicalUri
 * - CanonicalQueryString
 * - CanonicalHeaders
 * - SignedHeaders
 * - HashedPayload
 */
export const getCanonicalRequest = async ({
	body,
	headers,
	method,
	url,
}: HttpRequest): Promise<string> =>
	[
		method,
		getCanonicalUri(url.pathname),
		getCanonicalQueryString(url.searchParams),
		getCanonicalHeaders(headers),
		getSignedHeaders(headers),
		await getHashedPayload(body),
	].join('\n');
