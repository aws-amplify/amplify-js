// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KEY_TYPE_IDENTIFIER, SIGNATURE_IDENTIFIER } from '../constants';
import { getHashedData } from './dataHashHelpers';

/**
 * Returns a signing key to be used for signing requests.
 *
 * @param credentials `Credentials` with which the request will be signed.
 * @param date Current date in the format 'YYYYMMDD'.
 * @param region AWS region in which the service resides.
 * @param service Service to which the signed request is being sent.
 *
 * @returns `Uint8Array` calculated from its composite parts.
 */
export const getSigningKey = async (
	secretAccessKey: string,
	date: string,
	region: string,
	service: string
): Promise<Uint8Array> => {
	const key = `${SIGNATURE_IDENTIFIER}${secretAccessKey}`;
	const dateKey = await getHashedData(key, date);
	const regionKey = await getHashedData(dateKey, region);
	const serviceKey = await getHashedData(regionKey, service);
	const signingKey = await getHashedData(serviceKey, KEY_TYPE_IDENTIFIER);
	return signingKey;
};
