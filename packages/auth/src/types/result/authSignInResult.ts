// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthNextSignInStep, AuthUserAttributeKey } from '../models';

export type AuthSignInResult<UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey> = {
	isSignedIn: boolean;
	nextStep: AuthNextSignInStep<UserAttributeKey>;
}
