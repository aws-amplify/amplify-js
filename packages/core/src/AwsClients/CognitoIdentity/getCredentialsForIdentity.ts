import type {
	GetCredentialsForIdentityCommandInput as GetCredentialsForIdentityInput,
	GetCredentialsForIdentityCommandOutput as GetCredentialsForIdentityOutput,
	Credentials,
} from '@aws-sdk/client-cognito-identity';
import {
	buildHttpRpcRequest,
	cognitoIdentityTransferHandler,
	defaultConfigs,
	sharedHeaders,
} from './base';
import { composeServiceApi } from '../../clients/internal/composeApiHandler';
import { Endpoint, HttpRequest, HttpResponse } from '../../clients/types';
import {
	parseJsonBody,
	parseJsonError,
	parseMetadata,
} from '../../clients/serde';

export type {
	GetCredentialsForIdentityCommandInput as GetCredentialsForIdentityInput,
	GetCredentialsForIdentityCommandOutput as GetCredentialsForIdentityOutput,
} from '@aws-sdk/client-cognito-identity';

const getCredentialsForIdentitySerializer = (
	input: GetCredentialsForIdentityInput,
	endpoint: Endpoint
): HttpRequest => {
	const headers = sharedHeaders('GetCredentialsForIdentity');
	const body = JSON.stringify(input);
	return buildHttpRpcRequest(endpoint, headers, body);
};

const getCredentialsForIdentityDeserializer = async (
	response: HttpResponse
): Promise<GetCredentialsForIdentityOutput> => {
	if (response.statusCode >= 300) {
		const error = await parseJsonError(response);
		throw error;
	} else {
		const body = await parseJsonBody(response);
		return {
			IdentityId: body.IdentityId,
			Credentials: de_Credentials(body.Credentials),
			$metadata: parseMetadata(response),
		};
	}
};

const de_Credentials = (output: unknown = {}): Credentials => ({
	AccessKeyId: output['AccessKeyId'] as string,
	SecretKey: output['SecretKey'] as string,
	SessionToken: output['SessionToken'] as string,
	Expiration: new Date((output['Expiration'] as number) * 1000),
});

export const getCredentialsForIdentity = composeServiceApi(
	cognitoIdentityTransferHandler,
	getCredentialsForIdentitySerializer,
	getCredentialsForIdentityDeserializer,
	defaultConfigs
);
