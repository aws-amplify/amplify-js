// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import {
	AmplifyUrl,
	AmplifyUrlSearchParams,
} from '@aws-amplify/core/internals/utils';

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
 * 5. Validating the resulting URL has the same protocol, host and userinfo as the configured endpoint.
 *
 * @internal
 */
export const resolveApiUrl = (
	amplify: AmplifyContext,
	apiName: string,
	path: string,
	queryParams?: Record<string, string>,
): URL => {
	const urlStr = amplify.resourcesConfig?.API?.REST?.[apiName]?.endpoint;
	assertValidationError(!!urlStr, RestApiValidationErrorCode.InvalidApiName);
	let endpointUrl: URL;
	try {
		endpointUrl = parseUrl(urlStr);
	} catch (error) {
		throw new RestApiError({
			name: RestApiValidationErrorCode.InvalidApiName,
			...validationErrorMap[RestApiValidationErrorCode.InvalidApiName],
			recoverySuggestion: `Please make sure the REST endpoint URL is a valid URL string. Got ${urlStr}`,
		});
	}
	let url: URL;
	try {
		url = parseUrl(urlStr + path);
	} catch (error) {
		throw new RestApiError({
			name: RestApiValidationErrorCode.InvalidPath,
			...validationErrorMap[RestApiValidationErrorCode.InvalidPath],
		});
	}
	// Compare protocol, host and userinfo rather than `origin`, which is the opaque "null" for non-special schemes.
	assertValidationError(
		url.protocol === endpointUrl.protocol &&
			url.host === endpointUrl.host &&
			url.username === endpointUrl.username &&
			url.password === endpointUrl.password,
		RestApiValidationErrorCode.InvalidPath,
	);

	if (queryParams) {
		const mergedQueryParams = new AmplifyUrlSearchParams(url.searchParams);
		Object.entries(queryParams).forEach(([key, value]) => {
			mergedQueryParams.set(key, value);
		});
		url.search = new AmplifyUrlSearchParams(mergedQueryParams).toString();
	}

	return url;
};

const parseUrl = (urlStr: string): URL =>
	AmplifyUrl.canParse(urlStr)
		? new AmplifyUrl(urlStr)
		: new AmplifyUrl(urlStr, location?.origin);
