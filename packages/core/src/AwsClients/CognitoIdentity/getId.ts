// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	GetIdCommandInput as GetIdInput,
	GetIdCommandOutput as GetIdOutput,
} from '@aws-sdk/client-cognito-identity';
import {
	buildHttpRpcRequest,
	cognitoIdentityTransferHandler,
	defaultConfig,
	getSharedHeaders,
} from './base';
import { composeServiceApi } from '../../clients/internal/composeServiceApi';
import { Endpoint, HttpRequest, HttpResponse } from '../../clients/types';
import {
	parseJsonBody,
	parseJsonError,
	parseMetadata,
} from '../../clients/serde';

export type { GetIdInput, GetIdOutput };

const getIdSerializer = (
	input: GetIdInput,
	endpoint: Endpoint
): HttpRequest => {
	const headers = getSharedHeaders('GetId');
	const body = JSON.stringify(input);
	return buildHttpRpcRequest(endpoint, headers, body);
};

const getIdDeserializer = async (
	response: HttpResponse
): Promise<GetIdOutput> => {
	if (response.statusCode >= 300) {
		const error = await parseJsonError(response);
		throw error;
	} else {
		const body = await parseJsonBody(response);
		return {
			IdentityId: body.IdentityId,
			$metadata: parseMetadata(response),
		};
	}
};

export const getId = composeServiceApi(
	cognitoIdentityTransferHandler,
	getIdSerializer,
	getIdDeserializer,
	defaultConfig
);
