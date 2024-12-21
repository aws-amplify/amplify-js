// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const getSearchParamValueFromUrl = (
	urlStr: string,
	paramName: string,
): string | null => {
	if (urlStr.includes('?')) {
		const queryParams = urlStr.split('?')[1];
		if (queryParams) {
			return new URLSearchParams(queryParams).get(paramName);
		}
	}

	return null;
};
