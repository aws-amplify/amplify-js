import type {
	GetCredentialsForIdentityCommandInput,
	GetCredentialsForIdentityCommandOutput,
} from '@aws-sdk/client-cognito-identity';
import { cognitoIdentityTransferHandler, defaultConfigs } from './base';
import { composeServiceApi } from '../../clients/internal/composeApiHandler';
import { Endpoint, HttpRequest, HttpResponse } from '../../clients/types';
import { parseBody, throwError } from '../../clients/serde';

export type {
	GetCredentialsForIdentityCommandInput,
	GetCredentialsForIdentityCommandOutput,
} from '@aws-sdk/client-cognito-identity';

const getCredentialsForIdentitySerializer = async (
	input: GetCredentialsForIdentityCommandInput,
	endpoint: Endpoint
): Promise<HttpRequest> => {
	return {
		headers: {
			'content-type': 'application/x-amz-json-1.1',
			'x-amz-target': 'AWSCognitoIdentityService.GetCredentialsForIdentity',
		},
		method: 'POST',
		url: endpoint.url,
		body: JSON.stringify(input),
	};
};

const getCredentialsForIdentityDeserializer = async (
	response: HttpResponse
): Promise<GetCredentialsForIdentityCommandOutput> => {
	if (response.statusCode >= 300) {
		throw await throwError(response);
	} else {
		const body = await parseBody(response);
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
