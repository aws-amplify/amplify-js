// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthUserAttributeKey } from '..';

/**
 * Key/value pairs describing a user attribute.
 */
export type AuthUserAttribute<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey
> = {
	userAttributeKey: UserAttributeKey;
	value: string;
};
