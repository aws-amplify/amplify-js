// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Md5 } from '@smithy/md5-js';

import { toBase64 } from '../../src/providers/s3/utils/client/utils';
import { readFile } from '../../src/providers/s3/utils/readFile';

export const calculateContentMd5 = async (
	content: Blob | string | ArrayBuffer | ArrayBufferView,
): Promise<string> => {
	const hasher = new Md5();
	const buffer = content instanceof Blob ? await readFile(content) : content;
	hasher.update(buffer);
	const digest = await hasher.digest();

	return toBase64(digest);
};
