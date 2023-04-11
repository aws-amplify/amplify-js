// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthServiceOptions,
	AuthSignUpOptions,
	AuthUserAttributeKey,
} from '..';

/**
 * The parameters for constructing a Sign Up request.
 *
 * @param username - a standard username, potentially an email/phone number
 * @param password - the user's password
 * @param options - optional parameters fro the Sign Up process, including user attributes
 */
export type SignUpRequest<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions
> = {
	username: string;
	password: string;
	options?: AuthSignUpOptions<UserAttributeKey, ServiceOptions>;
};
