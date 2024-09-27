// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Deserializes a string to a number. Returns undefined if input is undefined.
 *
 * @internal
 */
export const deserializeNumber = (value?: string): number | undefined =>
	value ? Number(value) : undefined;
