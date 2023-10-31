// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Calculate the total size of the data to be uploaded. The total size is not required for multipart upload, as it's
 * only used in progress report.
 */
export const byteLength = (input?: any): number | undefined => {
	if (input === null || input === undefined) return 0;
	if (typeof input === 'string') {
		let len = input.length;

		for (let i = len - 1; i >= 0; i--) {
			const code = input.charCodeAt(i);
			if (code > 0x7f && code <= 0x7ff) len++;
			else if (code > 0x7ff && code <= 0xffff) len += 2;
			if (code >= 0xdc00 && code <= 0xdfff) i--; // trail surrogate
		}

		return len;
	} else if (typeof input.byteLength === 'number') {
		// handles Uint8Array, ArrayBuffer, Buffer, and ArrayBufferView
		return input.byteLength;
	} else if (typeof input.size === 'number') {
		// handles browser File object
		return input.size;
	}
	// TODO: support Node.js stream size when Node.js runtime is supported out-of-box.
	return undefined;
};
