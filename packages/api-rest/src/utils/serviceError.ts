// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { MetadataBearer } from '@aws-sdk/types';
import {
	HttpResponse,
	parseJsonError,
} from '@aws-amplify/core/internals/aws-client-utils';
import { RestApiError } from '../errors';

/**
 * Internal-only method to create a new RestApiError from a service error.
 *
 * @internal
 */
export const buildRestApiServiceError = (error: Error): RestApiError => {
	const restApiError = new RestApiError({
		name: error?.name,
		message: error.message,
		underlyingError: error,
	});
	return restApiError;
};

export const parseRestApiServiceError = async (
	response?: HttpResponse
): Promise<(RestApiError & MetadataBearer) | undefined> => {
	const parsedError = await parseJsonError(response);
	if (!parsedError) {
		// Response is not an error.
		return;
	}
	return Object.assign(buildRestApiServiceError(parsedError), {
		$metadata: parsedError.$metadata,
	});
};
