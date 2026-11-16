// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// A percent-escape produced by `encodeURIComponent`, or a character it left
// literal.
const PERCENT_ESCAPE_OR_CHARACTER = /%[0-9A-F]{2}|[\s\S]/g;

/**
 * Hex-encodes the UTF-8 bytes of a string, producing a string of `[0-9a-f]`
 * only. Characters outside that range do not survive Cognito's encoding of the
 * OAuth `state` parameter, see
 * https://github.com/aws-amplify/amplify-js/issues/5218
 *
 * `encodeURIComponent` already percent-escapes the UTF-8 bytes of every
 * character it does not leave literal, and the ones it leaves literal are
 * unreserved ASCII, one byte each.
 */
export function urlSafeEncode(str: string) {
	return encodeURIComponent(str).replace(PERCENT_ESCAPE_OR_CHARACTER, match =>
		match.startsWith('%')
			? match.slice(1).toLowerCase()
			: match.charCodeAt(0).toString(16).padStart(2, '0'),
	);
}
