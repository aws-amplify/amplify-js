// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Md5 } from '@smithy/md5-js';

import { FoundationContext } from '../types';

/**
 * Calculate the MD5 checksum of the given content as a base64 string.
 * Environment-specific dependencies (`readFile`, `toBase64`) are injected
 * via the {@link FoundationContext} so the foundation layer stays free of
 * any environment-discriminating logic.
 */
export const calculateContentMd5 = async (
	ctx: FoundationContext,
	content: Blob | string | ArrayBuffer | ArrayBufferView,
): Promise<string> => {
	const hasher = new Md5();
	const buffer =
		content instanceof Blob ? await ctx.readFile(content) : content;
	hasher.update(buffer);
	const digest = await hasher.digest();

	return ctx.toBase64(digest);
};
