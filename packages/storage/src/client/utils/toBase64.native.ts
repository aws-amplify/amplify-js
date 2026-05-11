// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Buffer } from 'buffer';

import { ToBase64 } from '../../foundation/types';

/**
 * Client-side `toBase64` implementation for React Native: uses the `buffer`
 * polyfill.
 */
export const toBase64: ToBase64 = input => {
	if (typeof input === 'string') {
		return Buffer.from(input, 'utf-8').toString('base64');
	}

	return Buffer.from(input.buffer, input.byteOffset, input.byteLength).toString(
		'base64',
	);
};
