import type {
	GetIdCommandInput,
	GetIdCommandOutput,
} from '@aws-sdk/client-cognito-identity';
import {
	buildHttpRpcRequest,
	cognitoIdentityTransferHandler,
	defaultConfigs,
	sharedHeaders,
} from './base';
import { composeServiceApi } from '../../clients/internal/composeApiHandler';
import { Endpoint, HttpRequest, HttpResponse } from '../../clients/types';
import { parseJsonBody, parseJsonError } from '../../clients/serde';

export type {
	GetIdCommandInput,
	GetIdCommandOutput,
} from '@aws-sdk/client-cognito-identity';

const getIdSerializer = (
	input: GetIdCommandInput,
	endpoint: Endpoint
): HttpRequest => {
	const headers = sharedHeaders('GetId');
	const body = JSON.stringify(input);
	return buildHttpRpcRequest(endpoint, headers, body);
};

const getIdDeserializer = async (
	response: HttpResponse
): Promise<GetIdCommandOutput> => {
	if (response.statusCode >= 300) {
		const error = await parseJsonError(response);
		throw error;
	} else {
		const body = await parseJsonBody(response);
		return body as GetIdCommandOutput;
	}
};

export const getId = composeServiceApi(
	cognitoIdentityTransferHandler,
	getIdSerializer,
	getIdDeserializer,
	defaultConfigs
);
