// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO: Remove this file once the remove/delete API is migrated to the
// 3-layer architecture. It is kept only for `deleteObjects` which still
// relies on the old `readFile` runtime guard. New code should import
// `calculateContentMd5` from `foundation/utils/md5` instead.

import { Md5 } from '@smithy/md5-js';

import { toBase64 } from './client/utils';
import { readFile } from './readFile';

export const calculateContentMd5 = async (
	content: Blob | string | ArrayBuffer | ArrayBufferView,
): Promise<string> => {
	const hasher = new Md5();
	const buffer = content instanceof Blob ? await readFile(content) : content;
	hasher.update(buffer);
	const digest = await hasher.digest();

	return toBase64(digest);
};
