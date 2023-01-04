// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthNextResetPasswordStep, AuthUserAttributeKey } from '../models';

export type ResetPasswordResult<UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey> = {
	isPasswordReset: boolean;
	nextStep: AuthNextResetPasswordStep<UserAttributeKey>;
};
