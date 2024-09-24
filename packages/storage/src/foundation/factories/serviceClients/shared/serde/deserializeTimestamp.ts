// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Deserializes a string to a Date. Returns undefined if input is undefined.
 * It supports epoch timestamp; rfc3339(cannot have a UTC, fractional precision supported); rfc7231(section 7.1.1.1)
 *
 * @see https://www.epoch101.com/
 * @see https://datatracker.ietf.org/doc/html/rfc3339.html#section-5.6
 * @see https://datatracker.ietf.org/doc/html/rfc7231.html#section-7.1.1.1
 *
 * @note For bundle size consideration, we use Date constructor to parse the timestamp string. There might be slight
 * difference among browsers.
 *
 * @internal
 */
export const deserializeTimestamp = (value: string): Date | undefined => {
	return value ? new Date(value) : undefined;
};
