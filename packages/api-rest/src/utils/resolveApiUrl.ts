// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import {
	RestApiError,
	RestApiValidationErrorCode,
	assertValidationError,
	validationErrorMap,
} from '../errors';

/**
 * Resolve the REST API request URL by:
 * 1. Loading the REST API endpoint from the Amplify configuration with corresponding API name.
 * 2. Appending the path to the endpoint.
 * 3. Merge the query parameters from path and the queryParameter argument which is taken from the public REST API
 *   options.
 * 4. Validating the resulting URL string.
 *
 * @internal
 */
export const resolveApiUrl = (
	amplify: AmplifyClassV6,
	apiName: string,
	path: string,
	queryParams?: Record<string, string>
): URL => {
	const urlStr = amplify.getConfig()?.API?.REST?.[apiName]?.endpoint;
	assertValidationError(!!urlStr, RestApiValidationErrorCode.InvalidApiName);
	try {
		const url = new URL(urlStr + path);
		if (queryParams) {
			const mergedQueryParams = new URLSearchParams(url.searchParams);
			Object.entries(queryParams).forEach(([key, value]) => {
				mergedQueryParams.set(key, value);
			});
			url.search = new URLSearchParams(mergedQueryParams).toString();
		}
		return url;
	} catch (error) {
		throw new RestApiError({
			name: RestApiValidationErrorCode.InvalidApiName,
			...validationErrorMap[RestApiValidationErrorCode.InvalidApiName],
			recoverySuggestion: `Please make sure the REST endpoint URL is a valid URL string. Got ${urlStr}`,
		});
	}
};
