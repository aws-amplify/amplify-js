// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Md5 } from '@smithy/md5-js';

import { toBase64 } from './client/utils';

export const calculateContentMd5 = async (
	content: Blob | string | ArrayBuffer | ArrayBufferView,
): Promise<string> => {
	const hasher = new Md5();
	const buffer = content instanceof Blob ? await readFile(content) : content;
	hasher.update(buffer);
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
		reader.readAsArrayBuffer(file);
	});
