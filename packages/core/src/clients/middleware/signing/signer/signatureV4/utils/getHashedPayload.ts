// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isArrayBuffer } from '@aws-sdk/is-array-buffer';
import { SourceData } from '@aws-sdk/types';
import { HttpRequest } from '../../../../../types';
import { EMPTY_HASH, UNSIGNED_PAYLOAD } from '../constants';
import { getHashedDataAsHex } from './dataHashHelpers';

/**
 * Returns the hashed payload.
 *
 * @param body `body` (payload) from the request.
 * @returns String created using the payload in the body of the HTTP request as input to a hash function. This string
 * uses lowercase hexadecimal characters. If the payload is empty, return precalculated result of an empty hash.
 */
export const getHashedPayload = async (
	body: HttpRequest['body']
): Promise<string> => {
	// return precalculated empty hash if body is undefined or null
	if (body == null) {
		return EMPTY_HASH;
	}

	if (isSourceData(body)) {
		const hashedData = await getHashedDataAsHex(null, body);
		return hashedData;
	}

	// Defined body is not signable. Return unsigned payload which may or may not be accepted by the service.
	return UNSIGNED_PAYLOAD;
};

const isSourceData = (body: HttpRequest['body']): body is SourceData =>
	typeof body === 'string' || ArrayBuffer.isView(body) || isArrayBuffer(body);
