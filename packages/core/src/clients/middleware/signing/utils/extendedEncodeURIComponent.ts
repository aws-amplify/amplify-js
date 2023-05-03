// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Wraps encodeURIComponent to encode additional characters to fully adhere to RFC 3986.
 *
 * @param uri URI string to encode
 * @returns RFC 3986 encoded string
 *
 * @internal
 */
export const extendedEncodeURIComponent = (uri: string): string =>
	encodeURIComponent(uri).replace(/[!'()*]/g, hexEncode);

const hexEncode = (c: string) =>
	`%${c.charCodeAt(0).toString(16).toUpperCase()}`;
