// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Endpoint,
	HttpRequest,
	parseMetadata,
	presignUrl,
	UserAgentOptions,
	PresignUrlOptions,
	EMPTY_SHA256_HASH,
} from '@aws-amplify/core/internals/aws-client-utils';
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';
import { USER_AGENT_HEADER } from '@aws-amplify/core';

import { S3EndpointResolverOptions, defaultConfig } from './base';
import type {
	CompatibleHttpResponse,
	GetObjectCommandInput,
	GetObjectCommandOutput,
} from './types';
import {
	deserializeBoolean,
	deserializeMetadata,
	deserializeNumber,
	deserializeTimestamp,
	map,
	parseXmlError,
	s3TransferHandler,
	serializeObjectSsecOptionsToHeaders,
	serializePathnameObjectKey,
	CONTENT_SHA256_HEADER,
} from './utils';

export type GetObjectInput = Pick<
	GetObjectCommandInput,
	| 'Bucket'
	| 'Key'
	| 'ResponseCacheControl'
	| 'ResponseContentDisposition'
	| 'ResponseContentEncoding'
	| 'ResponseContentLanguage'
	| 'ResponseContentType'
	| 'SSECustomerAlgorithm'
	| 'SSECustomerKey'
	// TODO(AllanZhengYP): remove in V6.
	| 'SSECustomerKeyMD5'
>;

export type GetObjectOutput = GetObjectCommandOutput;

const getObjectSerializer = async (
	input: GetObjectInput,
	endpoint: Endpoint
): Promise<HttpRequest> => {
	const headers = await serializeObjectSsecOptionsToHeaders(input);
	const query = map(input, {
		'response-cache-control': 'ResponseCacheControl',
		'response-content-disposition': 'ResponseContentDisposition',
		'response-content-encoding': 'ResponseContentEncoding',
		'response-content-language': 'ResponseContentLanguage',
		'response-content-type': 'ResponseContentType',
	});
	const url = new URL(endpoint.url.toString());
	url.pathname = serializePathnameObjectKey(url, input.Key);
	url.search = new URLSearchParams(query).toString();
	return {
		method: 'GET',
		headers,
		url,
	};
};

const getObjectDeserializer = async (
	response: CompatibleHttpResponse
): Promise<GetObjectOutput> => {
	if (response.statusCode >= 300) {
		const error = await parseXmlError(response);
		throw error;
	} else if (!response.body) {
		throw new Error('Got empty response body.');
	} else {
		return {
			...map(response.headers, {
				DeleteMarker: ['x-amz-delete-marker', deserializeBoolean],
				AcceptRanges: 'accept-ranges',
				Expiration: 'x-amz-expiration',
				Restore: 'x-amz-restore',
				LastModified: ['last-modified', deserializeTimestamp],
				ContentLength: ['content-length', deserializeNumber],
				ETag: 'etag',
				ChecksumCRC32: 'x-amz-checksum-crc32',
				ChecksumCRC32C: 'x-amz-checksum-crc32c',
				ChecksumSHA1: 'x-amz-checksum-sha1',
				ChecksumSHA256: 'x-amz-checksum-sha256',
				MissingMeta: ['x-amz-missing-meta', deserializeNumber],
				VersionId: 'x-amz-version-id',
				CacheControl: 'cache-control',
				ContentDisposition: 'content-disposition',
				ContentEncoding: 'content-encoding',
				ContentLanguage: 'content-language',
				ContentRange: 'content-range',
				ContentType: 'content-type',
				Expires: ['expires', deserializeTimestamp],
				WebsiteRedirectLocation: 'x-amz-website-redirect-location',
				ServerSideEncryption: 'x-amz-server-side-encryption',
				SSECustomerAlgorithm: 'x-amz-server-side-encryption-customer-algorithm',
				SSECustomerKeyMD5: 'x-amz-server-side-encryption-customer-key-md5',
				SSEKMSKeyId: 'x-amz-server-side-encryption-aws-kms-key-id',
				BucketKeyEnabled: [
					'x-amz-server-side-encryption-bucket-key-enabled',
					deserializeBoolean,
				],
				StorageClass: 'x-amz-storage-class',
				RequestCharged: 'x-amz-request-charged',
				ReplicationStatus: 'x-amz-replication-status',
				PartsCount: ['x-amz-mp-parts-count', deserializeNumber],
				TagCount: ['x-amz-tagging-count', deserializeNumber],
				ObjectLockMode: 'x-amz-object-lock-mode',
				ObjectLockRetainUntilDate: [
					'x-amz-object-lock-retain-until-date',
					deserializeTimestamp,
				],
				ObjectLockLegalHoldStatus: 'x-amz-object-lock-legal-hold',
			}),
			Metadata: deserializeMetadata(response.headers),
			$metadata: parseMetadata(response),
			Body: response.body,
		};
	}
};

export const getObject = composeServiceApi(
	s3TransferHandler,
	getObjectSerializer,
	getObjectDeserializer,
	{ ...defaultConfig, responseType: 'blob' }
);

/**
 * Get a presigned URL for the `getObject` API.
 *
 * @internal
 */
export const getPresignedGetObjectUrl = async (
	config: UserAgentOptions & PresignUrlOptions & S3EndpointResolverOptions,
	input: GetObjectInput
): Promise<string> => {
	const endpoint = defaultConfig.endpointResolver(config, input);
	const { url, headers, method } = await getObjectSerializer(input, endpoint);

	// TODO: set content sha256 query parameter with value of UNSIGNED-PAYLOAD.
	// It requires changes in presignUrl. Without this change, the generated url still works,
	// but not the same as other tools like AWS SDK and CLI.
	url.searchParams.append(CONTENT_SHA256_HEADER, EMPTY_SHA256_HASH);
	url.searchParams.append(
		config.userAgentHeader ?? USER_AGENT_HEADER,
		config.userAgentValue
	);

	for (const [headerName, value] of Object.entries(headers).sort(
		([key1], [key2]) => key1.localeCompare(key2)
	)) {
		url.searchParams.append(headerName, value);
	}
	return presignUrl(
		{ method, url, body: null },
		{
			...defaultConfig,
			...config,
		}
	).toString();
};
