// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Md5 } from '@aws-sdk/md5-js';
import { extendedEncodeURIComponent } from '@aws-amplify/core/internals/aws-client-utils';
import { toBase64, utf8Encode } from '../utils';

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

export const serializeObjectSsecOptionsToHeaders = async (
	input: ObjectSsecOptions
) => {
	if (!input.SSECustomerAlgorithm || !input.SSECustomerKey) {
		return input as Record<string, string>;
	}

	const sseCustomKeyMD5 = new Md5();
	sseCustomKeyMD5.update(utf8Encode(input.SSECustomerKey));
	const sseCustomKeyMD5Digest = await sseCustomKeyMD5.digest();

	return assignStringVariables({
		'x-amz-server-side-encryption-customer-algorithm':
			input.SSECustomerAlgorithm,
		// base64 encoded is need
		// see: https://docs.aws.amazon.com/AmazonS3/latest/userguide/ServerSideEncryptionCustomerKeys.html#specifying-s3-c-encryption
		'x-amz-server-side-encryption-customer-key':
			input.SSECustomerKey && toBase64(input.SSECustomerKey),
		'x-amz-server-side-encryption-customer-key-md5':
			input.SSECustomerKeyMD5 && toBase64(sseCustomKeyMD5Digest),
	});
};

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
export const serializeObjectConfigsToHeaders = async (
	input: ObjectConfigs
) => ({
	...(await serializeObjectSsecOptionsToHeaders(input)),
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
export const serializePathnameObjectKey = (url: URL, key: string) => {
	return (
		url.pathname.replace(/\/$/, '') +
		`/${key.split('/').map(extendedEncodeURIComponent).join('/')}`
	);
};
