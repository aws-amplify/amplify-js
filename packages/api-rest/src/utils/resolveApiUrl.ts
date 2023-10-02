// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';

export const resolveApiUrl = (
	amplify: AmplifyClassV6,
	apiName: string,
	queryParams?: Record<string, string>
): URL => {
	const urlStr = amplify.libraryOptions?.API?.REST?.[apiName]?.endpoint;
	if (!urlStr) {
		throw new Error(`API ${apiName} is not configured`);
	}
	try {
		const url = new URL(urlStr);
		url.search = new URLSearchParams(queryParams).toString();
		return url;
	} catch (error) {
		// TODO: throw invalid URL error
	}
};
