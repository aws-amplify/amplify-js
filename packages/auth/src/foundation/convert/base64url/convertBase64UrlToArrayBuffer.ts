// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { base64Decoder } from '@aws-amplify/core/internals/utils';

// https://datatracker.ietf.org/doc/html/rfc4648#page-7

/**
 * Converts a base64url encoded string to an ArrayBuffer
 * @param base64url - a base64url encoded string
 * @returns ArrayBuffer
 */
export const convertBase64UrlToArrayBuffer = (
	base64url: string,
): ArrayBuffer => {
	return Uint8Array.from(
		base64Decoder.convert(base64url.replace(/-/g, '+').replace(/_/g, '/')),
		x => x.charCodeAt(0),
	).buffer;
};
