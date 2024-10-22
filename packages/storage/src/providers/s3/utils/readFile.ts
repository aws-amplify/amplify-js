// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const readFile = (file: Blob): Promise<ArrayBuffer> =>
	new Promise((resolve, reject) => {
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
