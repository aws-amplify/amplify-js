// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO: Remove this file once the remove/delete API is migrated to the
// 3-layer architecture. It is kept only for the old `md5.ts` / `crc32.ts`
// utilities in this directory, which `deleteObjects` still uses. New code
// should import `readFile` from `client/utils/readFile` or
// `server/utils/readFile` depending on the environment.

export const readFile = (file: Blob): Promise<ArrayBuffer> => {
	// Browser path: use FileReader when available.
	if (typeof FileReader !== 'undefined') {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				resolve(reader.result as ArrayBuffer);
			};
			reader.onabort = () => {
				reject(new Error('Read aborted'));
			};
			reader.onerror = () => {
				reject(reader.error);
			};
			reader.readAsArrayBuffer(file);
		});
	}

	// Server (Node.js 18+) path: Blob/File both expose arrayBuffer().
	return file.arrayBuffer();
};
