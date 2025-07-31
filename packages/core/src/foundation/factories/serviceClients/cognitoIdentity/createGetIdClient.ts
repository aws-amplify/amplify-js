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
	GetIdCommandInput,
	GetIdCommandOutput,
	ServiceClientFactoryInput,
} from './types';

export const createGetIdClient = (config: ServiceClientFactoryInput) =>
	composeServiceApi(
		cognitoIdentityTransferHandler,
		createClientSerializer<GetIdCommandInput>('GetId'),
		getIdDeserializer,
		{
			...DEFAULT_SERVICE_CLIENT_API_CONFIG,
			...config,
			userAgentValue: getAmplifyUserAgent(),
		},
	);

const getIdDeserializer = async (
	response: HttpResponse,
): Promise<GetIdCommandOutput> => {
	if (response.statusCode >= 300) {
		const error = await parseJsonError(response);
		throw error;
	}

	const body = await parseJsonBody(response);

	return {
		IdentityId: body.IdentityId,
		$metadata: parseMetadata(response),
	};
};
