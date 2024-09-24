// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { assignStringVariables } from './assignStringVariables';

// Object configuration options when uploading an object.
interface ObjectConfigs {
	ACL?: string;
	CacheControl?: string;
	ContentDisposition?: string;
	ContentEncoding?: string;
	ContentLanguage?: string;
	ContentType?: string;
	Expires?: Date;
	Tagging?: string;
	Metadata?: Record<string, string>;
}

/**
 * Serailize the parameters for configuring the S3 object. Currently used by
 * `putObject` and `createMultipartUpload` API.
 *
 * @internal
 */
export const serializeObjectConfigsToHeaders = (input: ObjectConfigs) => ({
	...assignStringVariables({
		'x-amz-acl': input.ACL,
		'cache-control': input.CacheControl,
		'content-disposition': input.ContentDisposition,
		'content-language': input.ContentLanguage,
		'content-encoding': input.ContentEncoding,
		'content-type': input.ContentType,
		expires: input.Expires?.toUTCString(),
		'x-amz-tagging': input.Tagging,
		...serializeMetadata(input.Metadata),
	}),
});

const serializeMetadata = (
	metadata: Record<string, string> = {},
): Record<string, string> =>
	Object.keys(metadata).reduce((acc: any, suffix: string) => {
		acc[`x-amz-meta-${suffix.toLowerCase()}`] = metadata[suffix];

		return acc;
	}, {});
