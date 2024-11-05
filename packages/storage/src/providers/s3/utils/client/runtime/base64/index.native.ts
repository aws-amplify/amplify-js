// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Buffer } from 'buffer';

export function toBase64(input: string | ArrayBufferView): string {
	if (typeof input === 'string') {
		return Buffer.from(input, 'utf-8').toString('base64');
	}

	return Buffer.from(input.buffer).toString('base64');
}
