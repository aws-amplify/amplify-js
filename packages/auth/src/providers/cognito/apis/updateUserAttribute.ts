// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UpdateUserAttributeInput, UpdateUserAttributeOutput } from '../types';
import { UpdateUserAttributesException } from '../types/errors';
import { updateUserAttributes } from './updateUserAttributes';

/**
 * Updates user's attribute while authenticated.
 *
 * @param input - The UpdateUserAttributeInput object
 * @returns UpdateUserAttributeOutput
 * @throws - {@link UpdateUserAttributesException}
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export const updateUserAttribute = async (
	input: UpdateUserAttributeInput
): Promise<UpdateUserAttributeOutput> => {
	const {
		userAttribute: { attributeKey, value },
		options,
	} = input;
	const output = await updateUserAttributes({
		userAttributes: { [attributeKey]: value },
		options,
	});
	return Object.values(output)[0];
};
