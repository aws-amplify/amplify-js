// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';

export const resolveApiUrl = (
	amplify: AmplifyClassV6,
	apiName: string
): URL => {
	const urlStr = amplify.libraryOptions?.API?.REST?.[apiName]?.endpoint;
	if (!urlStr) {
		throw new Error(`API ${apiName} is not configured`);
	}
	try {
		return new URL(urlStr);
	} catch (error) {
		// TODO: throw invalid URL error
	}
};
