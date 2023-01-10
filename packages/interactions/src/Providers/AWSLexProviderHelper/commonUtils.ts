// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { base64ToArrayBuffer, gzipDecompressToString } from './utils';

export const unGzipBase64AsJson = async (gzipBase64: string | undefined) => {
	if (typeof gzipBase64 === 'undefined') return undefined;

	try {
		const decodedArrayBuffer = base64ToArrayBuffer(gzipBase64);

		const objString: string = await gzipDecompressToString(decodedArrayBuffer);

		return JSON.parse(objString);
	} catch (error) {
		return Promise.reject('unable to decode and decompress ' + error);
	}
};
