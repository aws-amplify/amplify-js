// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const resolveHeaders = (
	headers?: Record<string, string>,
	body?: unknown
) => {
	const normalizedHeaders: Record<string, string> = {};
	const isFormData = body instanceof FormData;
	for (const key in headers) {
		normalizedHeaders[key.toLowerCase()] = headers[key];
	}
	if (body) {
		normalizedHeaders['content-type'] = 'application/json; charset=UTF-8';
		if (body instanceof FormData) {
			/**
			 * If body is a FormData we should not allow setting content-type.
			 * It's because runtime HTTP handlers(xhr, fetch, undici, node-fetch,
			 * etc.) will modify the content-type value when setting multipart
			 * boundary.
			 */
			delete normalizedHeaders['content-type'];
		}
	}
	return normalizedHeaders;
};
