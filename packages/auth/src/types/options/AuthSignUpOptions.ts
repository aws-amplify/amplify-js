// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthServiceOptions,
	AuthUserAttribute,
	AuthUserAttributeKey,
} from '..';

/**
 * The optional parameters for the Sign Up process.
 *
 * @remarks
 * Particular services may require some of these parameters.
 */
export type AuthSignUpOptions<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions
> = {
	userAttributes: AuthUserAttribute<UserAttributeKey>;
	serviceOptions?: ServiceOptions;
};
