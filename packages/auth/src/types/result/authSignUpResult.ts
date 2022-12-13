// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthNextSignUpStep, AuthUserAttributeKey } from '../models';

export type AuthSignUpResult<UserAttributeKey extends AuthUserAttributeKey> = {
	isSignUpComplete: boolean;
	nextStep: AuthNextSignUpStep<UserAttributeKey>;
	userId?: string;
}
