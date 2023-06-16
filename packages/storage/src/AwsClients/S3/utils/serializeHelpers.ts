// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * @internal
 */
export const assignStringVariables = (
	values: Record<string, { toString: () => string } | undefined>
): Record<string, string> => {
	const queryParams = {};
	for (const [key, value] of Object.entries(values)) {
		if (value != null) {
			queryParams[key] = value.toString();
		}
	}
	return queryParams;
};

// Server-side encryption options
interface ObjectSsecOptions {
	SSECustomerAlgorithm?: string;
	SSECustomerKey?: string;
	SSECustomerKeyMD5?: string;
}

export const serializeObjectSsecOptionsToHeaders = (input: ObjectSsecOptions) =>
	assignStringVariables({
		'x-amz-server-side-encryption-customer-algorithm':
			input.SSECustomerAlgorithm,
		'x-amz-server-side-encryption-customer-key': input.SSECustomerKey,
		'x-amz-server-side-encryption-customer-key-md5': input.SSECustomerKeyMD5,
	});

// Object configuration options when uploading an object.
interface ObjectConfigs extends ObjectSsecOptions {
	ServerSideEncryption?: string;
	SSEKMSKeyId?: string;
	ACL?: string;
	CacheControl?: string;
	ContentDisposition?: string;
	ContentEncoding?: string;
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
	...serializeObjectSsecOptionsToHeaders(input),
	...assignStringVariables({
		'x-amz-server-side-encryption': input.ServerSideEncryption,
		'x-amz-server-side-encryption-aws-kms-key-id': input.SSEKMSKeyId,
		'x-amz-acl': input.ACL,
		'cache-control': input.CacheControl,
		'content-disposition': input.ContentDisposition,
		'content-encoding': input.ContentEncoding,
		'content-type': input.ContentType,
		expires: input.Expires?.toUTCString(),
		'x-amz-tagging': input.Tagging,
		...serializeMetadata(input.Metadata),
	}),
});

const serializeMetadata = (
	metadata: Record<string, string> = {}
): Record<string, string> =>
	Object.keys(metadata).reduce((acc: any, suffix: string) => {
		acc[`x-amz-meta-${suffix.toLowerCase()}`] = metadata[suffix];
		return acc;
	}, {});
