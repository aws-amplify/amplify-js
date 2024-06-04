// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

function bytesToBase64(bytes: Uint8Array): string {
	const base64Str = Array.from(bytes, x => String.fromCodePoint(x)).join('');

	return btoa(base64Str);
}

export function toBase64(input: string | ArrayBufferView): string {
	if (typeof input === 'string') {
		return bytesToBase64(new TextEncoder().encode(input));
	}

	return bytesToBase64(
		new Uint8Array(input.buffer, input.byteOffset, input.byteLength),
	);
}
