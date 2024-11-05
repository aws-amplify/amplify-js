// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthUserAttributes } from '../../../types';
import { AttributeType } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider/types';

/**
 * Transforms a user attributes object into an array of AttributeType objects.
 * @param attributes user attributes to be mapped to AttributeType objects.
 * @returns an array of AttributeType objects.
 */
export function toAttributeType<T extends Record<string, string | undefined>>(
	attributes: T,
): AttributeType[] {
	return Object.entries(attributes).map(([key, value]) => ({
		Name: key,
		Value: value,
	}));
}

/**
 * Transforms an array of AttributeType objects into a user attributes object.
 *
 * @param attributes - an array of AttributeType objects.
 * @returns AuthUserAttributes object.
 */
export function toAuthUserAttribute<T extends string = string>(
	attributes?: AttributeType[],
): AuthUserAttributes<T> {
	const userAttributes: AuthUserAttributes<string> = {};
	attributes?.forEach(attribute => {
		if (attribute.Name) userAttributes[attribute.Name] = attribute.Value;
	});

	return userAttributes;
}
