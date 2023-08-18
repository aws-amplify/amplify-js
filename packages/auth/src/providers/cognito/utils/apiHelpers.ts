// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AttributeType } from './clients/CognitoIdentityProvider/types';

/**
 * Transforms a user attributes object into an array of AttributeType objects.
 * @param attributes user attributes to be mapped to AttributeType objects.
 * @returns an array of AttributeType objects.
 */
export function toAttributeType<T extends Record<string, string | undefined>>(
	attributes: T
): AttributeType[] {
	return Object.entries(attributes).map(([key, value]) => ({
		Name: key,
		Value: value,
	}));
}
