// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// a regular expression that validates the origin string to be any valid origin, and allowing local development localhost
const originRegex =
	/^(http:\/\/localhost(:\d{1,5})?)|(https?:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*(:\d{1,5})?)$/;

export const isValidOrigin = (origin: string): boolean =>
	originRegex.test(origin);

export const isNonSSLOrigin = (origin: string): boolean =>
	originRegex.test(origin) && origin.startsWith('http://');
