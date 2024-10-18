// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Md5 } from '@smithy/md5-js';

import { toBase64 } from './client/utils';
import { readFile } from './readFile';

// The FileReader in React Native 0.71 did not support `readAsArrayBuffer`. This native implementation accomodates this
// by attempting to use `readAsArrayBuffer` and changing the file reading strategy if it throws an error.
// TODO: This file should be removable when we drop support for React Native 0.71
export const calculateContentMd5 = async (
	content: Blob | string | ArrayBuffer | ArrayBufferView,
): Promise<string> => {
	const hasher = new Md5();
	const buffer = content instanceof Blob ? await readFile(content) : content;
	hasher.update(buffer);
	const digest = await hasher.digest();

	return toBase64(digest);
};
