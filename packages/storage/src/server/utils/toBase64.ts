// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Buffer } from 'buffer';

import { ToBase64 } from '../../foundation/types';

/**
 * Server-side `toBase64` implementation for Node.js (18+). Uses the global
 * `Buffer` class, available on all supported Node.js versions. We still
 * import from `buffer` so the dependency is explicit for bundlers.
 */
export const toBase64: ToBase64 = input => {
	if (typeof input === 'string') {
		return Buffer.from(input, 'utf-8').toString('base64');
	}

	return Buffer.from(input.buffer).toString('base64');
};
