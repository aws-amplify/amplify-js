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
import {
	GetIdCommandInput as GetIdInput,
	GetIdCommandOutput as GetIdOutput,
} from './types';

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

/**
 * @internal
 */
export const getId = composeServiceApi(
	cognitoIdentityTransferHandler,
	getIdSerializer,
	getIdDeserializer,
	defaultConfig
);
