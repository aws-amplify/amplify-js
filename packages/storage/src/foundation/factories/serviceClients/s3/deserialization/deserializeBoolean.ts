// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Deserializes a string to a boolean. Returns undefined if input is undefined. Returns true if input is 'true',
 * otherwise false.
 *
 * @internal
 */
export const deserializeBoolean = (value?: string): boolean | undefined => {
	return value ? value === 'true' : undefined;
};
