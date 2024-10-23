// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Buffer } from 'buffer';

// The FileReader in React Native 0.71 did not support `readAsArrayBuffer`. This native implementation accommodates this
// by attempting to use `readAsArrayBuffer` and changing the file reading strategy if it throws an error.
// TODO: This file should be removable when we drop support for React Native 0.71
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

		try {
			reader.readAsArrayBuffer(file);
		} catch (e) {
			reader.onload = () => {
				// reference: https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
				// response from readAsDataURL is always prepended with "data:*/*;base64,"
				const [, base64Data] = (reader.result as string).split(',');
				const arrayBuffer = Buffer.from(base64Data, 'base64');
				resolve(arrayBuffer);
			};
			reader.readAsDataURL(file);
		}
	});
