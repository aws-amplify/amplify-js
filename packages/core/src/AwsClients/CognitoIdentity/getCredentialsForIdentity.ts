// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	buildHttpRpcRequest,
	cognitoIdentityTransferHandler,
	defaultConfig,
	getSharedHeaders,
} from './base';
import {
	Endpoint,
	HttpRequest,
	HttpResponse,
	parseJsonBody,
	parseJsonError,
	parseMetadata,
} from '../../clients';
import { composeServiceApi } from '../../clients/internal';
import type {
	GetCredentialsForIdentityCommandInput as GetCredentialsForIdentityInput,
	GetCredentialsForIdentityCommandOutput as GetCredentialsForIdentityOutput,
	Credentials,
} from './types';

export type { GetCredentialsForIdentityInput, GetCredentialsForIdentityOutput };

const getCredentialsForIdentitySerializer = (
	input: GetCredentialsForIdentityInput,
	endpoint: Endpoint
): HttpRequest => {
	const headers = getSharedHeaders('GetCredentialsForIdentity');
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
			Credentials: deserializeCredentials(body.Credentials),
			$metadata: parseMetadata(response),
		};
	}
};

const deserializeCredentials = (output: unknown = {}): Credentials => ({
	AccessKeyId: output['AccessKeyId'] as string,
	SecretKey: output['SecretKey'] as string,
	SessionToken: output['SessionToken'] as string,
	Expiration: new Date((output['Expiration'] as number) * 1000),
});

/**
 * @internal
 */
export const getCredentialsForIdentity = composeServiceApi(
	cognitoIdentityTransferHandler,
	getCredentialsForIdentitySerializer,
	getCredentialsForIdentityDeserializer,
	defaultConfig
);
