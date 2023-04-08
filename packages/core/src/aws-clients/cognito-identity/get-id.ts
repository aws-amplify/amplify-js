import type {
	GetIdCommandInput,
	GetIdCommandOutput,
} from '@aws-sdk/client-cognito-identity';
import { cognitoIdentityTransferHandler, defaultConfigs } from './base';
import { composeServiceApi } from '../../clients/internal/composeApiHandler';
import { Endpoint, HttpRequest, HttpResponse } from '../../clients/types';
import { parseBody, throwError } from '../../clients/serde';

export type {
	GetIdCommandInput,
	GetIdCommandOutput,
} from '@aws-sdk/client-cognito-identity';

const getIdSerializer = async (
	input: GetIdCommandInput,
	endpoint: Endpoint
): Promise<HttpRequest> => {
	return {
		headers: {
			'content-type': 'application/x-amz-json-1.1',
			'x-amz-target': 'AWSCognitoIdentityService.GetId',
		},
		method: 'POST',
		url: endpoint.url,
		body: JSON.stringify(input),
	};
};

const getIdDeserializer = async (
	response: HttpResponse
): Promise<GetIdCommandOutput> => {
	if (response.statusCode >= 300) {
		throw await throwError(response);
	} else {
		const body = await parseBody(response);
		return body as GetIdCommandOutput;
	}
};

export const getId = composeServiceApi(
	cognitoIdentityTransferHandler,
	getIdSerializer,
	getIdDeserializer,
	defaultConfigs
);
