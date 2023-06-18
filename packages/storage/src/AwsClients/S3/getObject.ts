import {
	Endpoint,
	Headers,
	HttpRequest,
	parseMetadata,
} from '@aws-amplify/core/internals/aws-client-utils';
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { defaultConfig } from './base';
import type {
	CompatibleHttpResponse,
	GetObjectCommandInput,
	GetObjectCommandOutput,
} from './types';
import {
	deserializeBoolean,
	deserializeNumber,
	deserializeTimestamp,
	map,
	parseXmlError,
	s3TransferHandler,
	serializeObjectSsecOptionsToHeaders,
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
	| 'SSECustomerKeyMD5'
>;

export type GetObjectOutput = GetObjectCommandOutput;

const getObjectSerializer = (
	input: GetObjectInput,
	endpoint: Endpoint
): HttpRequest => {
	const headers = serializeObjectSsecOptionsToHeaders(input);
	const query = map(input, {
		'response-cache-control': 'ResponseCacheControl',
		'response-content-disposition': 'ResponseContentDisposition',
		'response-content-encoding': 'ResponseContentEncoding',
		'response-content-language': 'ResponseContentLanguage',
		'response-content-type': 'ResponseContentType',
	});
	const url = new URL(endpoint.url.toString());
	url.hostname = `${input.Bucket}.${url.hostname}`;
	url.pathname = `/${input.Key}`;
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
			Body: response.body!,
		};
	}
};

const deserializeMetadata = (headers: Headers): Record<string, string> =>
	Object.keys(headers)
		.filter(header => header.startsWith('x-amz-meta-'))
		.reduce((acc, header) => {
			acc[header.substring(11)] = headers[header];
			return acc;
		}, {} as any);

export const getObject = composeServiceApi(
	s3TransferHandler,
	getObjectSerializer,
	getObjectDeserializer,
	{ ...defaultConfig, responseType: 'blob' }
);
