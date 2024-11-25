// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Decodes a URL-encoded string by replacing '+' characters with spaces and applying `decodeURIComponent`.
 * Reference:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent#decoding_query_parameters_from_a_url
 * @param {string} value - The URL-encoded string to decode.
 * @returns {string} The decoded string.
 */
export const urlDecode = (value: string): string => {
	return decodeURIComponent(value.replace(/\+/g, ' '));
};
