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
	queryParams?: Record<string, string>
): URL => {
	const urlStr = amplify.libraryOptions?.API?.REST?.[apiName]?.endpoint;
	assertValidationError(urlStr, RestApiValidationErrorCode.InvalidApiName);
	try {
		const url = new URL(urlStr);
		url.search = new URLSearchParams(queryParams).toString();
		return url;
	} catch (error) {
		throw new RestApiError({
			name: RestApiValidationErrorCode.InvalidApiName,
			...validationErrorMap[RestApiValidationErrorCode.InvalidApiName],
			recoverySuggestion: `Please make sure the REST endpoint URL is a valid URL string. Got ${urlStr}`,
		});
	}
};
