// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	HttpRequest,
	HttpResponse,
	authenticatedHandler,
	getRetryDecider,
	jitteredBackoff,
	parseJsonBody,
	parseJsonError,
} from '@aws-amplify/core/internals/aws-client-utils';
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';
import { AmplifyUrl } from '@aws-amplify/core/internals/utils';

import { LoggingConstraints } from '../types/configuration';

import {
	getLoggingConstraints,
	getLoggingConstraintsETag,
} from './loggingConstraintsHelpers';

/**
 * The service name used to sign requests.
 */
const SERVICE_NAME = 'execute-api';

const fetchRemoteLoggingConstraintsFromApiGatewaySerializer = (
	endpoint: string,
): HttpRequest => {
	const cachedETag = getLoggingConstraintsETag();

	return {
		method: 'GET',
		headers: {
			'content-type': 'application/json',
			...(cachedETag && { 'If-None-Match': cachedETag }),
		},
		url: new AmplifyUrl(endpoint),
	};
};

const fetchRemoteLoggingConstraintsFromApiGatewayDeserializer = async (
	response: HttpResponse,
): Promise<LoggingConstraints> => {
	if (response.statusCode === 304) {
		const cachedConstraints = getLoggingConstraints();
		if (cachedConstraints) {
			return cachedConstraints;
		}
	}
	if (response.statusCode >= 300) {
		const error = await parseJsonError(response);
		throw error;
	} else {
		const body = await parseJsonBody(response);

		return body;
	}
};

/**
 * @internal
 */
export const fetchRemoteLoggingConstraintsFromApiGateway = composeServiceApi(
	authenticatedHandler,
	fetchRemoteLoggingConstraintsFromApiGatewaySerializer,
	fetchRemoteLoggingConstraintsFromApiGatewayDeserializer,
	{
		service: SERVICE_NAME,
		endpointResolver: () => '',
		retryDecider: getRetryDecider(parseJsonError),
		computeDelay: jitteredBackoff,
	},
);
