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
import { assert, PinpointValidationErrorCode } from './errorHelpers';
import type {
	PutEventsCommandInput as PutEventsInput,
	PutEventsCommandOutput as PutEventsOutput,
} from './types';
import { AmplifyUrl } from '../../utils/amplifyUrl';

export type { PutEventsInput, PutEventsOutput };

const putEventsSerializer = (
	{ ApplicationId, EventsRequest }: PutEventsInput,
	endpoint: Endpoint
): HttpRequest => {
	assert(!!ApplicationId, PinpointValidationErrorCode.NoAppId);
	const headers = getSharedHeaders();
	const url = new AmplifyUrl(endpoint.url);
	url.pathname = `v1/apps/${extendedEncodeURIComponent(ApplicationId)}/events`;
	const body = JSON.stringify(EventsRequest ?? {});
	return { method: 'POST', headers, url, body };
};

const putEventsDeserializer = async (
	response: HttpResponse
): Promise<PutEventsOutput> => {
	if (response.statusCode >= 300) {
		const error = await parseJsonError(response);
		throw error;
	} else {
		const { Results } = await parseJsonBody(response);
		return {
			EventsResponse: { Results },
			$metadata: parseMetadata(response),
		};
	}
};

/**
 * @internal
 */
export const putEvents = composeServiceApi(
	authenticatedHandler,
	putEventsSerializer,
	putEventsDeserializer,
	defaultConfig
);
