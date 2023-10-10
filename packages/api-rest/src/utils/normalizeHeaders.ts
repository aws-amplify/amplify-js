// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const normalizeHeaders = (headers?: Record<string, string>) => {
	const normalizedHeaders: Record<string, string> = {};
	for (const key in headers) {
		normalizedHeaders[key.toLowerCase()] = headers[key];
	}
	return normalizedHeaders;
};
