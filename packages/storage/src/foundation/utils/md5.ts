// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Md5 } from '@smithy/md5-js';

import { toBase64 } from '../../providers/s3/utils/client/utils';
import { ReadFile } from '../types';

/**
 * Calculate the MD5 checksum of the given content as a base64 string. The
 * `readFile` dependency is injected so that the foundation layer stays free
 * of environment-specific logic (see {@link ReadFile}).
 */
export const calculateContentMd5 = async (
	content: Blob | string | ArrayBuffer | ArrayBufferView,
	readFile: ReadFile,
): Promise<string> => {
	const hasher = new Md5();
	const buffer = content instanceof Blob ? await readFile(content) : content;
	hasher.update(buffer);
	const digest = await hasher.digest();

	return toBase64(digest);
};
