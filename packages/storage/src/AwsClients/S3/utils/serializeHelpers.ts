// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { extendedEncodeURIComponent } from '@aws-amplify/core/internals/aws-client-utils';

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
	...serializeObjectSsecOptionsToHeaders(input),
	...assignStringVariables({
		'x-amz-server-side-encryption': input.ServerSideEncryption,
		'x-amz-server-side-encryption-aws-kms-key-id': input.SSEKMSKeyId,
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
	metadata: Record<string, string> = {}
): Record<string, string> =>
	Object.keys(metadata).reduce((acc: any, suffix: string) => {
		acc[`x-amz-meta-${suffix.toLowerCase()}`] = metadata[suffix];
		return acc;
	}, {});

/**
 * Serialize the object key to a URL pathname.
 * @see https://github.com/aws/aws-sdk-js-v3/blob/7ed7101dcc4e81038b6c7f581162b959e6b33a04/clients/client-s3/src/protocols/Aws_restXml.ts#L1108
 *
 * @internal
 */
export const serializeObjectKey = (url: URL, key: string) => {
	return (
		url.pathname.replace(/\/$/, '') +
		`/${key.split('/').map(extendedEncodeURIComponent).join('/')}`
	);
};
