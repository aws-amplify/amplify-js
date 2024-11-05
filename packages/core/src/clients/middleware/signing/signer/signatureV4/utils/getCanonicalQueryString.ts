// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Returns a canonical query string.
 *
 * @param searchParams `searchParams` from the request url.
 * @returns URL-encoded query string parameters, separated by ampersands (&). Percent-encode reserved characters,
 * including the space character. Encode names and values separately. If there are empty parameters, append the equals
 * sign to the parameter name before encoding. After encoding, sort the parameters alphabetically by key name. If there
 * is no query string, use an empty string ("").
 *
 * @internal
 */
export const getCanonicalQueryString = (
	searchParams: URLSearchParams,
): string =>
	Array.from(searchParams)
		.sort(([keyA, valA], [keyB, valB]) => {
			if (keyA === keyB) {
				return valA < valB ? -1 : 1;
			}

			return keyA < keyB ? -1 : 1;
		})
		.map(([key, val]) => `${escapeUri(key)}=${escapeUri(val)}`)
		.join('&');

const escapeUri = (uri: string): string =>
	encodeURIComponent(uri).replace(/[!'()*]/g, hexEncode);

const hexEncode = (c: string) =>
	`%${c.charCodeAt(0).toString(16).toUpperCase()}`;
