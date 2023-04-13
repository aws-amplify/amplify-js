import type {
	GetCredentialsForIdentityCommandInput,
	GetCredentialsForIdentityCommandOutput,
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
	GetCredentialsForIdentityCommandInput,
	GetCredentialsForIdentityCommandOutput,
} from '@aws-sdk/client-cognito-identity';

const getCredentialsForIdentitySerializer = (
	input: GetCredentialsForIdentityCommandInput,
	endpoint: Endpoint
): HttpRequest => {
	const headers = sharedHeaders('GetCredentialsForIdentity');
	const body = JSON.stringify(input);
	return buildHttpRpcRequest(endpoint, headers, body);
};

const getCredentialsForIdentityDeserializer = async (
	response: HttpResponse
): Promise<GetCredentialsForIdentityCommandOutput> => {
	if (response.statusCode >= 300) {
		const error = await parseJsonError(response);
		throw error;
	} else {
		const body = await parseJsonBody(response);
		return {
			...body,
			Credentials: {
				...body.Credentials,
				Expiration: new Date(body.Credentials.Expiration * 1000),
			},
		} as GetCredentialsForIdentityCommandOutput;
	}
};

export const getCredentialsForIdentity = composeServiceApi(
	cognitoIdentityTransferHandler,
	getCredentialsForIdentitySerializer,
	getCredentialsForIdentityDeserializer,
	defaultConfigs
);
