// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthNextSignInStep } from '../models/AuthNextSignInStep';
import { AuthUserAttributeKey } from '../models/AuthUserAttributeKey';

export type AuthSignInResult<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey
> = {
	isSignedIn: boolean;
	nextStep: AuthNextSignInStep<UserAttributeKey>;
};
