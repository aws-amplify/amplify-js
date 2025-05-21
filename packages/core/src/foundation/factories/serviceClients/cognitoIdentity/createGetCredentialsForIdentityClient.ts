// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	HttpResponse,
	parseJsonBody,
	parseJsonError,
	parseMetadata,
} from '../../../../clients';
import { composeServiceApi } from '../../../../clients/internal';
import { getAmplifyUserAgent } from '../../../../Platform';

import { DEFAULT_SERVICE_CLIENT_API_CONFIG } from './constants';
import { cognitoIdentityTransferHandler } from './handler';
import { createClientSerializer } from './serde';
import {
	Credentials,
	GetCredentialsForIdentityCommandOutput,
	GetCredentialsForIdentityInput,
	ServiceClientFactoryInput,
} from './types';

export const createGetCredentialsForIdentityClient = (
	config: ServiceClientFactoryInput,
) =>
	composeServiceApi(
		cognitoIdentityTransferHandler,
		createClientSerializer<GetCredentialsForIdentityInput>(
			'GetCredentialsForIdentity',
		),
		getCredentialsForIdentityDeserializer,
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
			userAgentValue: getAmplifyUserAgent(),
		},
	);

const getCredentialsForIdentityDeserializer = async (
	response: HttpResponse,
): Promise<GetCredentialsForIdentityCommandOutput> => {
	if (response.statusCode >= 300) {
		const error = await parseJsonError(response);
		throw error;
	}

	const body = await parseJsonBody(response);

	return {
		IdentityId: body.IdentityId,
		Credentials: deserializeCredentials(body.Credentials),
		$metadata: parseMetadata(response),
	};
};

const deserializeCredentials = ({
	Expiration,
	...rest
}: Credentials = {}): Credentials => ({
	...rest,
	Expiration: Expiration && new Date((Expiration as any) * 1000),
});
