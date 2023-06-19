import {
	Endpoint,
	HttpRequest,
	parseMetadata,
} from '@aws-amplify/core/internals/aws-client-utils';
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';
import { defaultConfig } from './base';
import type {
	CompatibleHttpResponse,
	HeadObjectCommandInput,
	HeadObjectCommandOutput,
} from './types';
import {
	deserializeMetadata,
	deserializeNumber,
	deserializeTimestamp,
	map,
	parseXmlError,
	s3TransferHandler,
	serializeObjectSsecOptionsToHeaders,
} from './utils';

export type HeadObjectInput = Pick<
	HeadObjectCommandInput,
	| 'Bucket'
	| 'Key'
	| 'SSECustomerKey'
	| 'SSECustomerKeyMD5'
	| 'SSECustomerAlgorithm'
>;

export type HeadObjectOutput = Pick<
	HeadObjectCommandOutput,
	| '$metadata'
	| 'ContentLength'
	| 'ContentType'
	| 'ETag'
	| 'LastModified'
	| 'Metadata'
	| 'VersionId'
>;

const headObjectSerializer = (
	input: HeadObjectInput,
	endpoint: Endpoint
): HttpRequest => {
	const headers = serializeObjectSsecOptionsToHeaders(input);
	const url = new URL(endpoint.url.toString());
	url.hostname = `${input.Bucket}.${url.hostname}`;
	url.pathname = `/${input.Key}`;
	return {
		method: 'HEAD',
		headers,
		url,
	};
};

const headObjectDeserializer = async (
	response: CompatibleHttpResponse
): Promise<HeadObjectOutput> => {
	if (response.statusCode >= 300) {
		const error = await parseXmlError(response);
		throw error;
	} else {
		const contents = {
			...map(response.headers, {
				ContentLength: ['content-length', deserializeNumber],
				ContentType: 'content-type',
				ETag: 'etag',
				LastModified: ['last-modified', deserializeTimestamp],
				VersionId: 'x-amz-version-id',
			}),
			Metadata: deserializeMetadata(response.headers),
		};
		return {
			$metadata: parseMetadata(response),
			...contents,
		};
	}
};

export const headObject = composeServiceApi(
	s3TransferHandler,
	headObjectSerializer,
	headObjectDeserializer,
	{ ...defaultConfig, responseType: 'text' }
);
