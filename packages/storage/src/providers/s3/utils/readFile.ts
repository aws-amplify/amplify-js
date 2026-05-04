// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

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
