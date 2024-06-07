// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Buffer } from 'buffer';

import { Md5 } from '@smithy/md5-js';

import { toBase64 } from './client/utils';

// The FileReader in React Native 0.71 did not support `readAsArrayBuffer`. This native implementation accomodates this
// by attempting to use `readAsArrayBuffer` and changing the file reading strategy if it throws an error.
// TODO: This file should be removable when we drop support for React Native 0.71
export const calculateContentMd5 = async (
	content: Blob | string | ArrayBuffer | ArrayBufferView,
): Promise<string> => {
	const hasher = new Md5();
	if (typeof content === 'string') {
		hasher.update(content);
	} else if (ArrayBuffer.isView(content) || content instanceof ArrayBuffer) {
		const blob = new Blob([content]);
		const buffer = await readFile(blob);
		hasher.update(buffer);
	} else {
		const buffer = await readFile(content);
		hasher.update(buffer);
	}
	const digest = await hasher.digest();

	return toBase64(digest);
};

const readFile = (file: Blob): Promise<ArrayBuffer> =>
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
