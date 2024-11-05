// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Endpoint,
	HttpRequest,
	HttpResponse,
	parseJsonBody,
	parseJsonError,
	parseMetadata,
} from '../../clients';
import { composeServiceApi } from '../../clients/internal';

import {
	buildHttpRpcRequest,
	cognitoIdentityTransferHandler,
	defaultConfig,
	getSharedHeaders,
} from './base';
import type {
	Credentials,
	GetCredentialsForIdentityCommandInput as GetCredentialsForIdentityInput,
	GetCredentialsForIdentityCommandOutput as GetCredentialsForIdentityOutput,
} from './types';

export type { GetCredentialsForIdentityInput, GetCredentialsForIdentityOutput };

const getCredentialsForIdentitySerializer = (
	input: GetCredentialsForIdentityInput,
	endpoint: Endpoint,
): HttpRequest => {
	const headers = getSharedHeaders('GetCredentialsForIdentity');
	const body = JSON.stringify(input);

	return buildHttpRpcRequest(endpoint, headers, body);
};

const getCredentialsForIdentityDeserializer = async (
	response: HttpResponse,
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

const deserializeCredentials = ({
	AccessKeyId,
	SecretKey,
	SessionToken,
	Expiration,
}: Credentials = {}): Credentials => {
	return {
		AccessKeyId,
		SecretKey,
		SessionToken,
		Expiration: Expiration && new Date((Expiration as any) * 1000),
	};
};

/**
 * @internal
 */
export const getCredentialsForIdentity = composeServiceApi(
	cognitoIdentityTransferHandler,
	getCredentialsForIdentitySerializer,
	getCredentialsForIdentityDeserializer,
	defaultConfig,
);
