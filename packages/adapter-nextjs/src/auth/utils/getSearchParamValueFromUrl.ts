// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const getSearchParamValueFromUrl = (
	urlStr: string,
	paramName: string,
): string | null => {
	try {
		return new URL(urlStr).searchParams.get(paramName);
	} catch (error) {
		// In Next.js Pages Router the request object is an instance of IncomingMessage
		// whose url property may contain only the path part of the URL + query params.
		// In this case, we need to parse the URL manually
		if (urlStr.includes('?')) {
			const queryParams = urlStr.split('?')[1];
			if (queryParams) {
				return new URLSearchParams(queryParams).get(paramName);
			}
		}

		return null;
	}
};
