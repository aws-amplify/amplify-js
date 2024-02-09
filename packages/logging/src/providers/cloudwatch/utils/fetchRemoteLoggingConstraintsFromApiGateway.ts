// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	HttpRequest,
	HttpResponse,
	SigningOptions,
	fetchTransferHandler,
	parseJsonBody,
	parseJsonError,
	signingMiddleware,
} from '@aws-amplify/core/internals/aws-client-utils';
import {
	composeServiceApi,
	composeTransferHandler,
} from '@aws-amplify/core/internals/aws-client-utils/composers';
import { AmplifyUrl } from '@aws-amplify/core/internals/utils';

import { LoggingConstraints } from '../types/configuration';

import {
	getLoggingConstraints,
	getLoggingConstraintsETag,
	setLoggingConstraintsETag,
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
	const { headers, statusCode } = response;
	if (statusCode === 304) {
		const cachedConstraints = getLoggingConstraints();
		if (cachedConstraints) {
			return cachedConstraints;
		}
	}
	if (statusCode >= 300) {
		const error = await parseJsonError(response);
		throw error;
	} else {
		if (headers.etag) {
			setLoggingConstraintsETag(headers.etag);
		}
		const body = await parseJsonBody(response);

		return body;
	}
};

const signedTransferHandler = composeTransferHandler<
	[SigningOptions],
	HttpRequest,
	HttpResponse,
	typeof fetchTransferHandler
>(fetchTransferHandler, [signingMiddleware]);

/**
 * @internal
 */
export const fetchRemoteLoggingConstraintsFromApiGateway = composeServiceApi(
	signedTransferHandler,
	fetchRemoteLoggingConstraintsFromApiGatewaySerializer,
	fetchRemoteLoggingConstraintsFromApiGatewayDeserializer,
	{ service: SERVICE_NAME, endpointResolver: () => '' },
);
