// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { authenticatedHandler } from '../../clients/handlers/authenticated';
import { composeServiceApi } from '../../clients/internal/composeServiceApi';
import { extendedEncodeURIComponent } from '../../clients/middleware/signing/utils/extendedEncodeURIComponent';
import {
	parseJsonBody,
	parseJsonError,
	parseMetadata,
} from '../../clients/serde';
import { Endpoint, HttpRequest, HttpResponse } from '../../clients/types';
import { defaultConfig, getSharedHeaders } from './base';
import type {
	UpdateEndpointCommandInput as UpdateEndpointInput,
	UpdateEndpointCommandOutput as UpdateEndpointOutput,
} from './types';

export type { UpdateEndpointInput, UpdateEndpointOutput };

const updateEndpointSerializer = (
	{ ApplicationId, EndpointId, EndpointRequest }: UpdateEndpointInput,
	endpoint: Endpoint
): HttpRequest => {
	const headers = getSharedHeaders();
	const url = new URL(endpoint.url);
	url.pathname = `v1/apps/${extendedEncodeURIComponent(
		ApplicationId
	)}/endpoints/${extendedEncodeURIComponent(EndpointId)}`;
	const body = JSON.stringify(EndpointRequest ?? {});
	return { method: 'PUT', headers, url, body };
};

const updateEndpointDeserializer = async (
	response: HttpResponse
): Promise<UpdateEndpointOutput> => {
	if (response.statusCode >= 300) {
		const error = await parseJsonError(response);
		throw error;
	} else {
		const { Message, RequestID } = await parseJsonBody(response);
		return {
			MessageBody: {
				Message,
				RequestID,
			},
			$metadata: parseMetadata(response),
		};
	}
};

/**
 * @internal
 */
export const updateEndpoint = composeServiceApi(
	authenticatedHandler,
	updateEndpointSerializer,
	updateEndpointDeserializer,
	defaultConfig
);
