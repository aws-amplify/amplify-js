// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Md5 } from '@aws-sdk/md5-js';
import { toBase64, utf8Encode } from '../AwsClients/S3/utils';

export const calculateContentMd5 = async (
	content: Blob | string
): Promise<string> => {
	const hasher = new Md5();
	if (typeof content === 'string') {
		hasher.update(content);
	} else {
		const buffer = await readFileToBase64(content);
		hasher.update(utf8Encode(buffer));
	}
	const digest = await hasher.digest();
	return toBase64(digest);
};

const readFileToBase64 = (blob: Blob): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			// reference: https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
			// response from readAsDataURL is always prepended with "data:*/*;base64,"
			// reference: https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readyState
			if (reader.readyState !== 2) {
				return reject(new Error('Reader aborted too early'));
			}
			resolve((reader.result as string).split(',')[1]);
		};
		reader.onabort = () => reject(new Error('Read aborted'));
		reader.onerror = () => reject(reader.error);
		// reader.readAsArrayBuffer is not available in RN
		reader.readAsDataURL(blob);
	});
};
