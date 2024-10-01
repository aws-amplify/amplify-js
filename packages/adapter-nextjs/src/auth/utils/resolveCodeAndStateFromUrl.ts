// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getSearchParamValueFromUrl } from './getSearchParamValueFromUrl';

export const resolveCodeAndStateFromUrl = (
	urlStr: string,
): {
	code: string | null;
	state: string | null;
} => ({
	state: getSearchParamValueFromUrl(urlStr, 'state'),
	code: getSearchParamValueFromUrl(urlStr, 'code'),
});
