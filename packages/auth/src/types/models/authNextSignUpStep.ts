// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AdditionalInfo, AuthCodeDeliveryDetails, AuthSignUpStep } from '.';
import { AuthUserAttributeKey } from './authUserAttributeKey';

export type AuthNextSignUpStep<UserAttributeKey extends AuthUserAttributeKey> = {
	signUpStep: AuthSignUpStep;
	additionalInfo?: AdditionalInfo;
	codeDeliveryDetails?: AuthCodeDeliveryDetails<UserAttributeKey>;
}
