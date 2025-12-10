// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Endpoint,
	HttpRequest,
	HttpResponse,
	PresignUrlOptions,
	UNSIGNED_PAYLOAD,
	UserAgentOptions,
	parseMetadata,
	presignUrl,
} from '@aws-amplify/core/internals/aws-client-utils';
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';
import {
	AmplifyUrl,
	AmplifyUrlSearchParams,
} from '@aws-amplify/core/internals/utils';

import {
	assignStringVariables,
	buildStorageServiceError,
	deserializeBoolean,
	deserializeMetadata,
	deserializeNumber,
	deserializeTimestamp,
	map,
	s3TransferHandler,
	serializePathnameObjectKey,
	validateS3RequiredParameter,
} from '../utils';
import { validateObjectUrl } from '../../validateObjectUrl';

import {
	S3EndpointResolverOptions,
	defaultConfig,
	parseXmlError,
} from './base';
import type {
	CompatibleHttpResponse,
	GetObjectCommandInput,
	GetObjectCommandOutput,
} from './types';

const USER_AGENT_HEADER = 'x-amz-user-agent';

export type GetObjectInput = Pick<
	GetObjectCommandInput,
	| 'Bucket'
	| 'Key'
	| 'Range'
	| 'ResponseContentDisposition'
	| 'ResponseContentType'
	| 'ExpectedBucketOwner'
	| 'ResponseCacheControl'
>;

export type GetObjectOutput = GetObjectCommandOutput;

const getObjectSerializer = async (
	input: GetObjectInput,
	endpoint: Endpoint,
): Promise<HttpRequest> => {
	const url = new AmplifyUrl(endpoint.url.toString());
	validateS3RequiredParameter(!!input.Key, 'Key');
	url.pathname = serializePathnameObjectKey(url, input.Key);
	url.search = new AmplifyUrlSearchParams({
		'x-id': 'GetObject',
		...(input.ResponseCacheControl && {
			'response-cache-control': input.ResponseCacheControl,
		}),
	}).toString();
	validateObjectUrl({
		bucketName: input.Bucket,
		key: input.Key,
		objectURL: url,
	});

	return {
		method: 'GET',
		headers: {
			...(input.Range && { Range: input.Range }),
			...assignStringVariables({
				'x-amz-expected-bucket-owner': input.ExpectedBucketOwner,
			}),
		},
		url,
	};
};

const getObjectDeserializer = async (
	response: HttpResponse,
): Promise<GetObjectOutput> => {
	if (response.statusCode >= 300) {
		// error is always set when statusCode >= 300
		throw buildStorageServiceError((await parseXmlError(response))!);
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
				ChecksumType: 'x-amz-checksum-type',
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
			// @ts-expect-error The body is a CompatibleHttpResponse type because the lower-level handler is XHR instead of
			// fetch, which represents payload in Blob instread of ReadableStream.
			Body: response.body as CompatibleHttpResponse,
		};
	}
};

export const getObject = composeServiceApi(
	s3TransferHandler,
	getObjectSerializer,
	getObjectDeserializer,
	{ ...defaultConfig, responseType: 'blob' },
);

type S3GetObjectPresignedUrlConfig = Omit<
	UserAgentOptions & PresignUrlOptions & S3EndpointResolverOptions,
	'signingService' | 'signingRegion'
> & {
	signingService?: string;
	signingRegion?: string;
};

/**
 * Get a presigned URL for the `getObject` API.
 *
 * @internal
 */
export const getPresignedGetObjectUrl = async (
	config: S3GetObjectPresignedUrlConfig,
	input: GetObjectInput,
): Promise<URL> => {
	const endpoint = defaultConfig.endpointResolver(config, input);
	const { url, headers, method } = await getObjectSerializer(input, endpoint);

	if (config.userAgentValue) {
		url.searchParams.append(
			config.userAgentHeader ?? USER_AGENT_HEADER,
			config.userAgentValue,
		);
	}
	if (input.ResponseContentType) {
		url.searchParams.append('response-content-type', input.ResponseContentType);
	}
	if (input.ResponseContentDisposition) {
		url.searchParams.append(
			'response-content-disposition',
			input.ResponseContentDisposition,
		);
	}

	for (const [headerName, value] of Object.entries(headers).sort(
		([key1], [key2]) => key1.localeCompare(key2),
	)) {
		url.searchParams.append(headerName, value);
	}

	return presignUrl(
		{ method, url, body: UNSIGNED_PAYLOAD },
		{
			signingService: defaultConfig.service,
			signingRegion: config.region,
			...defaultConfig,
			...config,
		},
	);
};
