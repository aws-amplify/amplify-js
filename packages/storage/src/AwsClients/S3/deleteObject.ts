import {
	Endpoint,
	HttpRequest,
	HttpResponse,
	parseMetadata,
} from '@aws-amplify/core/internals/aws-client-utils';
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';
import { MetadataBearer } from '@aws-sdk/types';
import type { DeleteObjectCommandInput } from './types';

import { defaultConfig } from './base';
import { parseXmlError, s3TransferHandler } from './utils';

export type DeleteObjectInput = Pick<
	DeleteObjectCommandInput,
	'Bucket' | 'Key'
>;

export type DeleteObjectOutput = MetadataBearer;

const deleteObjectSerializer = (
	input: DeleteObjectInput,
	endpoint: Endpoint
): HttpRequest => {
	const url = new URL(endpoint.url.toString());
	url.hostname = `${input.Bucket}.${url.hostname}`;
	url.pathname = `/${input.Key}`;
	return {
		method: 'DELETE',
		headers: {},
		url,
	};
};

const deleteObjectDeserializer = async (
	response: HttpResponse
): Promise<DeleteObjectOutput> => {
	if (response.statusCode >= 300) {
		const error = await parseXmlError(response);
		throw error;
	} else {
		return {
			$metadata: parseMetadata(response),
		};
	}
};

export const deleteObject = composeServiceApi(
	s3TransferHandler,
	deleteObjectSerializer,
	deleteObjectDeserializer,
	{ ...defaultConfig, responseType: 'text' }
);
