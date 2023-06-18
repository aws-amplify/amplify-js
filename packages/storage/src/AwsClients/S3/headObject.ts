import {
	Endpoint,
	HttpRequest,
	parseMetadata,
} from '@aws-amplify/core/internals/aws-client-utils';
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';
import { MetadataBearer } from '@aws-sdk/types';
import { defaultConfig } from './base';
import type {
	CompatibleHttpResponse,
	HeadObjectCommandInput,
	HeadObjectCommandOutput,
} from './types';
import {
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
>;

export type HeadObjectOutput = MetadataBearer;

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
		// TODO: parse the response body
		return {
			$metadata: parseMetadata(response),
		};
	}
};

export const headObject = composeServiceApi(
	s3TransferHandler,
	headObjectSerializer,
	headObjectDeserializer,
	{ ...defaultConfig, responseType: 'text' }
);
