// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0


/**
 * Denotes the next step in the Update User Attribute process.
 */
export enum AuthUpdateAttributeStep {
	/**
	 * Auth update attribute step requires user to confirm an attribute with a code sent to cellphone or email.
	 */
	CONFIRM_ATTRIBUTE_WITH_CODE = 'CONFIRM_ATTRIBUTE_WITH_CODE',

	/**
	 * Auth update attribute step indicates that the attribute is updated.
	 */
	DONE = 'DONE',
}
