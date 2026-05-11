// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Encode a string or binary buffer as base64. Uses cross-environment
 * primitives (`TextEncoder`, `btoa`, `Uint8Array`) that are available in all
 * supported runtimes (modern browsers, Node.js 18+, and React Native).
 */
export const toBase64 = (input: string | ArrayBufferView): string => {
	const bytes =
		typeof input === 'string'
			? new TextEncoder().encode(input)
			: new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
	const base64Str = Array.from(bytes, x => String.fromCodePoint(x)).join('');

	return btoa(base64Str);
};
