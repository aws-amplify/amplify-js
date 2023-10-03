// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import {
	RestApiError,
	RestApiValidationErrorCode,
	assertValidationError,
	validationErrorMap,
} from '../errors';

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
