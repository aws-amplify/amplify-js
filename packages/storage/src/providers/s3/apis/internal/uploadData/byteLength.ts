// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Calculate the total size of the data to be uploaded. The total size is not required for multipart upload, as it's
 * only used in progress report.
 */
export const byteLength = (input?: any): number | undefined => {
	if (input === null || input === undefined) return 0;
	if (typeof input === 'string') {
		const blob = new Blob([input]);

		return blob.size;
	} else if (typeof input.byteLength === 'number') {
		// handles Uint8Array, ArrayBuffer, Buffer, and ArrayBufferView
		return input.byteLength;
	} else if (typeof input.size === 'number') {
		// handles browser File object
		return input.size;
	}

	return undefined;
};
