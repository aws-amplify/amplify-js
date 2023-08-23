// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SignRequestOptions } from '../types';
import { SigningValues } from '../types/signer';
import { getCredentialScope } from './getCredentialScope';
import { getFormattedDates } from './getFormattedDates';

/**
 * Extracts common values used for signing both requests and urls.
 *
 * @param options `SignRequestOptions` object containing values used to construct the signature.
 * @returns Common `SigningValues` used for signing.
 *
 * @internal
 */
export const getSigningValues = ({
	credentials,
	signingDate = new Date(),
	signingRegion,
	signingService,
	uriEscapePath = true,
}: SignRequestOptions): SigningValues => {
	// get properties from credentials
	const { accessKeyId, secretAccessKey, sessionToken } = credentials;
	// get formatted dates for signing
	const { longDate, shortDate } = getFormattedDates(signingDate);
	// copy header and set signing properties
	const credentialScope = getCredentialScope(
		shortDate,
		signingRegion,
		signingService
	);
	return {
		accessKeyId,
		credentialScope,
		longDate,
		secretAccessKey,
		sessionToken,
		shortDate,
		signingRegion,
		signingService,
		uriEscapePath,
	};
};
