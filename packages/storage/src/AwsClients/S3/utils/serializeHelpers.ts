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
	const getMd5Digest = async (content: any) => {
		const md5Hasher = new Md5();
		md5Hasher.update(utf8Encode(content));
		return md5Hasher.digest();
	};

	return assignStringVariables({
		'x-amz-server-side-encryption-customer-algorithm':
			input.SSECustomerAlgorithm,
		// base64 encoded is need
		// see: https://docs.aws.amazon.com/AmazonS3/latest/userguide/ServerSideEncryptionCustomerKeys.html#specifying-s3-c-encryption
		'x-amz-server-side-encryption-customer-key':
			input.SSECustomerKey && toBase64(input.SSECustomerKey),
		// Calculate the md5 digest of the the SSE-C key, for compatibility with AWS SDK
		// see: https://github.com/aws/aws-sdk-js-v3/blob/91fc83307c38cc9cbe0b3acd919557d5b5b831d6/packages/middleware-ssec/src/index.ts#L36
		'x-amz-server-side-encryption-customer-key-md5':
			input.SSECustomerKey &&
			toBase64(await getMd5Digest(input.SSECustomerKey)),
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
