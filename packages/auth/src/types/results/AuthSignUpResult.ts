// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthNextSignUpStep, AuthUserAttributeKey } from '..';

/**
 * The Result of a Sign Up request.
 *
 */
export type AuthSignUpResult<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey
> = {
	isSignUpComplete: boolean;
	nextStep: AuthNextSignUpStep<UserAttributeKey>;
};
