// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Decodes a string produced by `urlSafeEncode` back into its original value.
 */
export function urlSafeDecode(hex: string) {
	const bytes = hex.match(/.{2}/g) ?? [];

	try {
		return decodeURIComponent(bytes.map(byte => `%${byte}`).join(''));
	} catch {
		// Earlier versions encoded one UTF-16 code unit per byte, which is not
		// valid UTF-8 above U+00FF. Read such a value the way it was written, so
		// an OAuth flow that spans an upgrade still completes. A value written by
		// `urlSafeEncode` is always valid UTF-8, so it never reaches this branch.
		return bytes.map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
	}
}
