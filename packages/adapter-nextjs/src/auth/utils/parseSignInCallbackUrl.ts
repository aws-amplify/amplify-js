// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getSearchParamValueFromUrl } from './getSearchParamValueFromUrl';

export const parseSignInCallbackUrl = (
	urlStr: string,
): {
	code: string | null;
	state: string | null;
	error: string | null;
	errorDescription: string | null;
} => ({
	state: getSearchParamValueFromUrl(urlStr, 'state'),
	code: getSearchParamValueFromUrl(urlStr, 'code'),
	error: getSearchParamValueFromUrl(urlStr, 'error'),
	errorDescription: getSearchParamValueFromUrl(urlStr, 'error_description'),
});
