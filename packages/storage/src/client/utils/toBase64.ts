// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ToBase64 } from '../../foundation/types';

/**
 * Client-side `toBase64` implementation for browsers: uses `btoa` +
 * `TextEncoder`.
 */
export const toBase64: ToBase64 = input => {
	const bytes =
		typeof input === 'string'
			? new TextEncoder().encode(input)
			: new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
	const base64Str = Array.from(bytes, x => String.fromCodePoint(x)).join('');

	return btoa(base64Str);
};
