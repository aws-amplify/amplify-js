// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpRequest } from '../../../../../types';

/**
 * Returns canonical headers.
 *
 * @param headers Headers from the request.
 * @returns Request headers that will be signed, and their values, separated by newline characters. Header names must
 * use lowercase characters, must appear in alphabetical order, and must be followed by a colon (:). For the values,
 * trim any leading or trailing spaces, convert sequential spaces to a single space, and separate the values
 * for a multi-value header using commas.
 *
 * @internal
 */
export const getCanonicalHeaders = (headers: HttpRequest['headers']): string =>
	Object.entries(headers)
		.map(([key, value]) => ({
			key: key.toLowerCase(),
			value: value?.trim().replace(/\s+/g, ' ') ?? '',
		}))
		.sort((a, b) => (a.key < b.key ? -1 : 1))
		.map(entry => `${entry.key}:${entry.value}\n`)
		.join('');
