// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// https://datatracker.ietf.org/doc/html/rfc4648#page-7

/**
 * Converts a base64url encoded string to an ArrayBuffer
 * @param base64url - a base64url encoded string
 * @returns ArrayBuffer
 */
export const convertBase64UrlToArrayBuffer = (
	base64url: string,
): ArrayBuffer => {
	const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');

	return Uint8Array.from(atob(base64), x => x.charCodeAt(0)).buffer;
};

/**
 * Converts an ArrayBuffer to a base64url encoded string
 * @param buffer - the ArrayBuffer instance of a Uint8Array
 * @returns string - a base64url encoded string
 */
export const convertArrayBufferToBase64Url = (buffer: ArrayBuffer): string => {
	return btoa(String.fromCharCode(...new Uint8Array(buffer)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
};
