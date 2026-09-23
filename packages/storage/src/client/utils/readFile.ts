// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ReadFile } from '../../foundation/types';

/**
 * Client-side `readFile` implementation for browsers: uses `FileReader`.
 */
export const readFile: ReadFile = blob =>
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
		reader.readAsArrayBuffer(blob);
	});
