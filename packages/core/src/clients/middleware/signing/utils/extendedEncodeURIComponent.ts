// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Wraps encodeURIComponent to encode additional characters to fully adhere to RFC 3986.
 * @see https://github.com/smithy-lang/smithy-typescript/blob/0d9cee80619a89a6585fa2339c4382084c6036bc/packages/core/src/submodules/protocols/extended-encode-uri-component.ts#L7
 *
 * @param uri URI string to encode
 * @returns RFC 3986 encoded string
 *
 * @internal
 */
export const extendedEncodeURIComponent = (uri: string): string => {
	// Match characters normally not encoded by `encodeURIComponent`
	const extendedCharacters = /[!'()*]/g;

	return encodeURIComponent(uri).replace(extendedCharacters, hexEncode);
};

const hexEncode = (c: string) =>
	`%${c.charCodeAt(0).toString(16).toUpperCase()}`;
